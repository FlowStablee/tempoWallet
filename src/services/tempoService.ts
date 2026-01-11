/**
 * TEMPO SERVICE
 * Core blockchain interaction layer for Tempo network
 */

import {
    ethers,
    JsonRpcProvider,
    Wallet,
    Contract,
    formatUnits,
    parseUnits,
    keccak256,
    toUtf8Bytes,
    isAddress,
} from 'ethers';
import { TEMPO_NETWORK, CONTRACTS, DEFAULT_TOKENS, TokenInfo } from '../config/tempo';
import { TIP20_ABI, FEE_MANAGER_ABI } from '../abis/tip20';
import { TokenBalance } from '../store/walletStore';

class TempoService {
    private provider: JsonRpcProvider;
    private wallet: Wallet | null = null;

    constructor() {
        this.provider = new JsonRpcProvider(TEMPO_NETWORK.rpc, {
            chainId: TEMPO_NETWORK.chainId,
            name: TEMPO_NETWORK.name,
        });
    }

    /**
     * Initialize wallet with private key
     */
    setWallet(privateKey: string): string {
        this.wallet = new Wallet(privateKey, this.provider);
        return this.wallet.address;
    }

    /**
     * Create new random wallet
     */
    createWallet(): { address: string; privateKey: string } {
        const randomWallet = Wallet.createRandom();
        // Connect to provider by creating new wallet instance
        this.wallet = new Wallet(randomWallet.privateKey, this.provider);
        return {
            address: this.wallet.address,
            privateKey: randomWallet.privateKey,
        };
    }

    /**
     * Import wallet from private key
     */
    importWallet(privateKey: string): { address: string; privateKey: string } {
        try {
            // Handle with or without 0x prefix
            const pk = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
            const wallet = new Wallet(pk, this.provider);
            this.wallet = wallet;
            return {
                address: wallet.address,
                privateKey: wallet.privateKey,
            };
        } catch (error) {
            throw new Error('Invalid private key format');
        }
    }

    /**
     * Get current wallet address
     */
    getAddress(): string | null {
        return this.wallet?.address || null;
    }

    /**
     * Get balance for a single token
     */
    async getTokenBalance(
        address: string,
        tokenAddress: string
    ): Promise<{ balance: bigint; formatted: string }> {
        try {
            const contract = new Contract(tokenAddress, TIP20_ABI, this.provider);
            const balance = await contract.balanceOf(address);
            const decimals = await contract.decimals();
            return {
                balance,
                formatted: formatUnits(balance, decimals),
            };
        } catch (error) {
            console.error(`Error fetching balance for ${tokenAddress}:`, error);
            return { balance: BigInt(0), formatted: '0.00' };
        }
    }

    /**
     * Get balances for all default + custom tokens
     */
    async getAllBalances(
        address: string,
        customTokens: TokenInfo[] = []
    ): Promise<TokenBalance[]> {
        const allTokens = [...DEFAULT_TOKENS, ...customTokens];
        const balances: TokenBalance[] = [];

        for (const token of allTokens) {
            try {
                const { balance, formatted } = await this.getTokenBalance(
                    address,
                    token.address
                );
                balances.push({
                    ...token,
                    balance: balance.toString(),
                    balanceFormatted: this.formatBalance(formatted),
                });
            } catch (error) {
                balances.push({
                    ...token,
                    balance: '0',
                    balanceFormatted: '0.00',
                });
            }
        }

        return balances;
    }

    /**
     * Format balance with 2 decimal places
     */
    private formatBalance(value: string): string {
        const num = parseFloat(value);
        if (isNaN(num)) return '0.00';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
        return num.toFixed(2);
    }

    /**
     * Get user's fee token preference
     */
    async getUserFeeToken(address: string): Promise<string> {
        try {
            const contract = new Contract(
                CONTRACTS.FEE_MANAGER,
                FEE_MANAGER_ABI,
                this.provider
            );
            const feeToken = await contract.getUserToken(address);
            // If zero address, return default
            if (feeToken === ethers.ZeroAddress) {
                return DEFAULT_TOKENS[0].address;
            }
            return feeToken;
        } catch (error) {
            console.error('Error getting fee token:', error);
            return DEFAULT_TOKENS[0].address;
        }
    }

    /**
     * Set user's fee token preference
     */
    async setUserFeeToken(tokenAddress: string): Promise<string> {
        if (!this.wallet) throw new Error('Wallet not connected');

        const contract = new Contract(
            CONTRACTS.FEE_MANAGER,
            FEE_MANAGER_ABI,
            this.wallet
        );
        const tx = await contract.setUserToken(tokenAddress);
        await tx.wait();
        return tx.hash;
    }

    /**
     * Transfer tokens (standard or with memo)
     */
    async transfer(
        tokenAddress: string,
        to: string,
        amount: string,
        memo?: string, //
        decimals: number = 6
    ): Promise<string> {
        if (!this.wallet) throw new Error('Wallet not connected');
        if (!isAddress(to)) throw new Error('Invalid recipient address');

        const contract = new Contract(tokenAddress, TIP20_ABI, this.wallet);
        const amountUnits = parseUnits(amount, decimals);

        let tx;

        if (memo && memo.trim()) {
            // Convert memo to bytes32
            const memoBytes = this.stringToBytes32(memo);
            tx = await contract.transferWithMemo(to, amountUnits, memoBytes);
        } else {
            tx = await contract.transfer(to, amountUnits);
        }

        return tx.hash;
    }

    /**
     * Wait for transaction confirmation
     */
    async waitForTransaction(hash: string): Promise<{ status: boolean }> {
        const receipt = await this.provider.waitForTransaction(hash);
        return { status: receipt?.status === 1 };
    }

    /**
     * Convert string to bytes32 for memo
     */
    private stringToBytes32(str: string): string {
        // If longer than 31 chars, hash it
        if (str.length > 31) {
            return keccak256(toUtf8Bytes(str));
        }
        // Otherwise pad it
        return ethers.encodeBytes32String(str.slice(0, 31));
    }

    /**
     * Validate TIP-20 token address
     */
    async validateToken(address: string): Promise<TokenInfo | null> {
        if (!isAddress(address)) return null;

        try {
            const contract = new Contract(address, TIP20_ABI, this.provider);
            const [name, symbol, decimals] = await Promise.all([
                contract.name(),
                contract.symbol(),
                contract.decimals(),
            ]);

            return {
                address,
                name,
                symbol,
                decimals: Number(decimals),
                isDefault: false,
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Get gas estimate for transfer
     */
    async estimateGas(
        tokenAddress: string,
        to: string,
        amount: string,
        memo?: string
    ): Promise<string> {
        if (!this.wallet) throw new Error('Wallet not connected');

        const contract = new Contract(tokenAddress, TIP20_ABI, this.wallet);
        const amountUnits = parseUnits(amount, 6);

        let gasEstimate;
        if (memo) {
            const memoBytes = this.stringToBytes32(memo);
            gasEstimate = await contract.transferWithMemo.estimateGas(
                to,
                amountUnits,
                memoBytes
            );
        } else {
            gasEstimate = await contract.transfer.estimateGas(to, amountUnits);
        }

        // Convert to approximate USD (gas is paid in stablecoin)
        const gasPrice = await this.provider.getFeeData();
        const gasCost = gasEstimate * (gasPrice.gasPrice || BigInt(0));
        return formatUnits(gasCost, 6); // Returns in USD
    }

    /**
     * Get network info
     */
    async getNetworkInfo(): Promise<{
        blockNumber: number;
        chainId: number;
        connected: boolean;
    }> {
        try {
            const blockNumber = await this.provider.getBlockNumber();
            const network = await this.provider.getNetwork();
            return {
                blockNumber,
                chainId: Number(network.chainId),
                connected: true,
            };
        } catch (error) {
            return {
                blockNumber: 0,
                chainId: TEMPO_NETWORK.chainId,
                connected: false,
            };
        }
    }
}

// Singleton instance
export const tempoService = new TempoService();

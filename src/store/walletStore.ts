/**
 * WALLET STORE
 * Zustand state management for Tempo Wallet
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_TOKENS, TokenInfo } from '../config/tempo';

export interface TokenBalance extends TokenInfo {
    balance: string;
    balanceFormatted: string;
}

export interface Transaction {
    hash: string;
    from: string;
    to: string;
    amount: string;
    token: string;
    tokenSymbol: string;
    memo?: string;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
}

interface WalletState {
    // Wallet
    address: string | null;
    privateKey: string | null;
    isConnected: boolean;

    // Tokens
    tokens: TokenBalance[];
    customTokens: TokenInfo[];
    feeToken: string;

    // Transactions
    transactions: Transaction[];
    pendingTx: string | null;

    // Settings
    isSponsored: boolean;

    // UI State
    isLoading: boolean;
    error: string | null;

    // Actions
    setWallet: (address: string, privateKey: string) => void;
    clearWallet: () => void;
    setTokens: (tokens: TokenBalance[]) => void;
    addCustomToken: (token: TokenInfo) => void;
    removeCustomToken: (address: string) => void;
    setFeeToken: (address: string) => void;
    addTransaction: (tx: Transaction) => void;
    updateTransaction: (hash: string, status: Transaction['status']) => void;
    setPendingTx: (hash: string | null) => void;
    setSponsored: (value: boolean) => void;
    setLoading: (value: boolean) => void;
    setError: (error: string | null) => void;
}

export const useWalletStore = create<WalletState>()(
    persist(
        (set, get) => ({
            // Initial state
            address: null,
            privateKey: null,
            isConnected: false,
            tokens: [],
            customTokens: [],
            feeToken: DEFAULT_TOKENS[0].address, // pathUSD default
            transactions: [],
            pendingTx: null,
            isSponsored: false,
            isLoading: false,
            error: null,

            // Actions
            setWallet: (address, privateKey) =>
                set({
                    address,
                    privateKey,
                    isConnected: true,
                    error: null,
                }),

            clearWallet: () =>
                set({
                    address: null,
                    privateKey: null,
                    isConnected: false,
                    tokens: [],
                    transactions: [],
                    pendingTx: null,
                }),

            setTokens: (tokens) => set({ tokens }),

            addCustomToken: (token) =>
                set((state) => ({
                    customTokens: [...state.customTokens, token],
                })),

            removeCustomToken: (address) =>
                set((state) => ({
                    customTokens: state.customTokens.filter(
                        (t) => t.address.toLowerCase() !== address.toLowerCase()
                    ),
                })),

            setFeeToken: (address) => set({ feeToken: address }),

            addTransaction: (tx) =>
                set((state) => ({
                    transactions: [tx, ...state.transactions].slice(0, 50), // Keep last 50
                })),

            updateTransaction: (hash, status) =>
                set((state) => ({
                    transactions: state.transactions.map((tx) =>
                        tx.hash === hash ? { ...tx, status } : tx
                    ),
                })),

            setPendingTx: (hash) => set({ pendingTx: hash }),

            setSponsored: (value) => set({ isSponsored: value }),

            setLoading: (value) => set({ isLoading: value }),

            setError: (error) => set({ error }),
        }),
        {
            name: 'tempo-wallet-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                // Only persist these fields
                address: state.address,
                privateKey: state.privateKey,
                isConnected: state.isConnected,
                customTokens: state.customTokens,
                feeToken: state.feeToken,
                transactions: state.transactions,
                isSponsored: state.isSponsored,
            }),
        }
    )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useWalletAddress = () => useWalletStore((s) => s.address);
export const useIsConnected = () => useWalletStore((s) => s.isConnected);
export const useTokens = () => useWalletStore((s) => s.tokens);
export const useFeeToken = () => useWalletStore((s) => s.feeToken);
export const useIsLoading = () => useWalletStore((s) => s.isLoading);
export const useIsSponsored = () => useWalletStore((s) => s.isSponsored);

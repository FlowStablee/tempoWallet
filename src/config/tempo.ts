/**
 * TEMPO NETWORK CONFIGURATION
 * Moderato Testnet - Chain ID 42431
 */

export const TEMPO_NETWORK = {
  chainId: 42431,
  chainIdHex: '0xa5cf',
  name: 'Tempo Moderato Testnet',
  rpc: 'https://rpc.moderato.tempo.xyz',
  explorer: 'https://explore.tempo.xyz',
  explorerApi: 'https://explore.tempo.xyz/api',
  currency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 6,
  },
  faucetUrl: 'https://docs.tempo.xyz/quickstart/faucet',
  sponsorUrl: 'https://sponsor.moderato.tempo.xyz',
};

/**
 * PREDEPLOYED CONTRACT ADDRESSES
 * These are fixed addresses on Tempo network
 */
export const CONTRACTS = {
  // System contracts
  FEE_MANAGER: '0x1000000000000000000000000000000000000000',
  TIP20_FACTORY: '0x20Fc000000000000000000000000000000000000',
  DEX: '0x20D0000000000000000000000000000000000000',
  POLICY_REGISTRY: '0x2000000000000000000000000000000000000403',
  ACCOUNT_KEYCHAIN: '0x0000000000000000000000000000000000000100',
};

/**
 * DEFAULT TOKENS - Available on Faucet
 * Each faucet claim provides 1M of each token
 */
export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  isDefault: boolean;
}

export const DEFAULT_TOKENS: TokenInfo[] = [
  {
    address: '0x20c0000000000000000000000000000000000000',
    symbol: 'pathUSD',
    name: 'Path USD',
    decimals: 6,
    isDefault: true,
  },
  {
    address: '0x20c0000000000000000000000000000000000001',
    symbol: 'αUSD',
    name: 'Alpha USD',
    decimals: 6,
    isDefault: true,
  },
  {
    address: '0x20c0000000000000000000000000000000000002',
    symbol: 'βUSD',
    name: 'Beta USD',
    decimals: 6,
    isDefault: true,
  },
  {
    address: '0x20c0000000000000000000000000000000000003',
    symbol: 'θUSD',
    name: 'Theta USD',
    decimals: 6,
    isDefault: true,
  },
];

/**
 * Get token by address
 */
export const getTokenByAddress = (address: string): TokenInfo | undefined => {
  return DEFAULT_TOKENS.find(
    t => t.address.toLowerCase() === address.toLowerCase()
  );
};

/**
 * Check if address is a TIP-20 token (has the prefix)
 */
export const isTIP20Address = (address: string): boolean => {
  return address.toLowerCase().startsWith('0x20c');
};

/**
 * Explorer URLs
 */
export const getExplorerUrl = {
  tx: (hash: string) => `${TEMPO_NETWORK.explorer}/tx/${hash}`,
  address: (addr: string) => `${TEMPO_NETWORK.explorer}/address/${addr}`,
  token: (addr: string) => `${TEMPO_NETWORK.explorer}/token/${addr}`,
};

# Tempo Wallet

A modern, payment-first mobile wallet for the **Tempo blockchain**.

## Features

- 🔐 **Create/Import Wallet** - Generate new wallet or import via private key
- 💸 **Send Payments** - Transfer TIP-20 tokens with optional payment memos
- 📥 **Receive** - Display wallet address for incoming payments
- 💰 **Multi-Token Support** - View balances for pathUSD, AlphaUSD, BetaUSD, ThetaUSD
- ➕ **Add Custom Tokens** - Add any TIP-20 token by contract address
- ⛽ **Fee Token Selection** - Choose which stablecoin to pay gas fees with
- 💧 **Faucet Integration** - Easy access to testnet token claiming
- ⚙️ **Settings** - Network info, contract addresses, private key export

## Tempo Network

Tempo is a **payment-optimized, EVM-compatible blockchain** with:

- ⚡ **500ms finality** - Near-instant transaction confirmation
- 💵 **No native token** - All fees paid in USD stablecoins
- 📝 **Built-in memos** - Attach payment references on-chain
- 🔄 **Batch transactions** - Multiple payments in one transaction

### Network Details (Moderato Testnet)

| Property | Value |
|----------|-------|
| Chain ID | `42431` |
| RPC URL | `https://rpc.moderato.tempo.xyz` |
| Explorer | `https://explore.tempo.xyz` |
| Currency | `USD` |

## Getting Started

### Prerequisites

- Node.js 18+
- React Native development environment
- Android Studio or Xcode

### Installation

```bash
# Clone the repository
git clone https://github.com/FlowStablee/tempoWallet.git
cd tempoWallet

# Install dependencies
npm install

# iOS (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start
```

### Running

```bash
# Android
npm run android

# iOS
npm run ios
```

## Project Structure

```
tempoWallet/
├── App.tsx                    # Main entry point with navigation
├── src/
│   ├── config/
│   │   └── tempo.ts           # Network config & token definitions
│   ├── abis/
│   │   └── tip20.ts           # TIP-20 and system contract ABIs
│   ├── store/
│   │   └── walletStore.ts     # Zustand state management
│   ├── services/
│   │   └── tempoService.ts    # Blockchain interaction layer
│   └── screens/
│       ├── AuthScreen.tsx     # Login/create/import wallet
│       ├── HomeScreen.tsx     # Dashboard with balances
│       ├── SendScreen.tsx     # Send payment with memo
│       ├── ReceiveScreen.tsx  # Display address
│       ├── FaucetScreen.tsx   # Claim testnet tokens
│       ├── TokensScreen.tsx   # Manage tokens
│       └── SettingsScreen.tsx # Fee token & network info
```

## Key Dependencies

- **ethers.js v6** - Ethereum library for blockchain interactions
- **zustand** - Lightweight state management
- **react-native-get-random-values** - Crypto polyfill
- **@react-native-async-storage** - Persistent storage

## Default Tokens

| Token | Address |
|-------|---------|
| pathUSD | `0x20c0000000000000000000000000000000000000` |
| AlphaUSD | `0x20c0000000000000000000000000000000000001` |
| BetaUSD | `0x20c0000000000000000000000000000000000002` |
| ThetaUSD | `0x20c0000000000000000000000000000000000003` |

## System Contracts

| Contract | Address |
|----------|---------|
| Fee Manager | `0x1000000000000000000000000000000000000000` |
| TIP20 Factory | `0x20Fc000000000000000000000000000000000000` |
| Stablecoin DEX | `0x20D0000000000000000000000000000000000000` |
| Policy Registry | `0x2000000000000000000000000000000000000403` |

## Documentation

- [Tempo Docs](https://docs.tempo.xyz)
- [Wallet Developer Guide](https://docs.tempo.xyz/quickstart/wallet-developers)
- [Faucet](https://docs.tempo.xyz/quickstart/faucet)

## License

MIT

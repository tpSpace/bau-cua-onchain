# Bau Cua Smart Contract Integration Guide

## 🎉 **Integration Complete!**

Your Bau Cua game has been successfully integrated with the Sui blockchain smart contract. Here's what we've accomplished:

## 📁 **New Files Created**

### 1. `/lib/contract.ts`

- Smart contract constants and configuration
- Symbol mapping between UI and contract (0-5)
- Utility functions for SUI/MIST conversion
- Type definitions for game data

### 2. `/lib/game-contract.ts`

- GameContract class for blockchain interactions
- Functions for playing games, splitting coins, getting balances
- Smart coin management for optimal betting

### 3. `/hooks/useGameContract.ts`

- React hook for easy contract integration
- State management for wallet connection, coins, and game results
- Error handling and loading states

## 🎮 **Updated Game Features**

### **Real Blockchain Gaming**

- ✅ Connects to Sui Testnet
- ✅ Uses real SUI tokens for betting
- ✅ Cryptographically secure random number generation
- ✅ Transparent, verifiable game results

### **Improved UI**

- ✅ Wallet connection prompts
- ✅ Real-time SUI balance display
- ✅ Bank treasury balance indicator
- ✅ Error handling with user-friendly messages
- ✅ Transaction status indicators
- ✅ Success/failure notifications

### **Smart Contract Features**

- ✅ Automatic coin splitting for exact bet amounts
- ✅ Gas optimization
- ✅ Event-based result parsing
- ✅ Multi-symbol betting support

## 🔧 **How to Test**

### 1. **Start the Application**

```bash
npm run dev
```

### 2. **Connect Wallet**

- Install Sui Wallet browser extension
- Switch to Testnet
- Connect your wallet to the app

### 3. **Get Testnet SUI**

- Visit [Sui Testnet Faucet](https://faucet.testnet.sui.io/)
- Request testnet SUI tokens

### 4. **Play the Game**

- Select symbols to bet on
- Choose bet amounts (0.1, 0.25, 0.5, 1.0 SUI)
- Click "Roll" to play
- Watch real blockchain transactions!

## 📊 **Contract Information**

- **Package ID**: `0xd303b0d0165b19f85727d32187a22e76f9f3f31895c7c23ce5f80e01d2c98cac`
- **Bank Object**: `0xca86008a4262ec597021dab6c070e76a04d423d4011240fe3cf5ca6e0657a735`
- **Network**: Sui Testnet
- **Bank Treasury**: ~1.1 SUI (and growing!)

## 🎲 **Symbol Mapping**

| UI Symbol | Contract Index | Vietnamese | English |
|-----------|----------------|------------|---------|
| 🥒 (bau)  | 0              | Bầu        | Gourd   |
| 🦐 (tom)  | 1              | Tôm        | Shrimp  |
| 🐟 (ca)   | 2              | Cá         | Fish    |
| 🐓 (ga)   | 3              | Gà         | Rooster |
| 🦀 (cua)  | 4              | Cua        | Crab    |
| 🦌 (nai)  | 5              | Nai        | Deer    |

## 🚀 **Key Features**

### **Smart Coin Management**
- Automatically finds the best coin for betting
- Splits large coins when needed
- Optimizes gas usage

### **Real-time Updates**
- Live balance updates after each game
- Bank treasury balance monitoring
- Transaction status tracking

### **Error Handling**
- Insufficient balance detection
- Network error recovery
- User-friendly error messages

### **Security**
- All randomness comes from Sui's secure RNG
- Transparent smart contract execution
- Immutable game logic

## 🎯 **Game Rules (On-Chain)**

1. **Betting**: Choose 1-6 symbols and bet amounts
2. **Rolling**: Smart contract generates 3 random dice
3. **Winning**: Get 2x your bet for each matching die
4. **Payouts**: Automatic SUI transfers to your wallet

## 📱 **User Experience**

### **Wallet Connected**
- Real SUI balance displayed
- All game features enabled
- Live transaction feedback

### **Wallet Not Connected**
- Clear connection prompts
- Game interface disabled
- Helpful guidance messages

## 🔗 **External Links**

- [View Contract on SuiScan](https://suiscan.xyz/testnet/object/0xd303b0d0165b19f85727d32187a22e76f9f3f31895c7c23ce5f80e01d2c98cac)
- [View Bank Object](https://suiscan.xyz/testnet/object/0xca86008a4262ec597021dab6c070e76a04d423d4011240fe3cf5ca6e0657a735)
- [Sui Testnet Faucet](https://faucet.testnet.sui.io/)

## 🎊 **What's Next?**

Your game is now fully integrated with the blockchain! Players can:
- ✅ Play with real cryptocurrency
- ✅ Enjoy provably fair gaming
- ✅ Experience true ownership of their winnings
- ✅ Verify all game results on-chain

**Ready to launch! 🚀**

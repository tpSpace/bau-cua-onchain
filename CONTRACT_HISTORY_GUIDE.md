# Contract Activity History Feature

## 🎯 **Overview**

Your Bau Cua game now includes a comprehensive **Global Activity** section that displays all transactions and game results for your smart contract `0xd303b0d0165b19f85727d32187a22e76f9f3f31895c7c23ce5f80e01d2c98cac`.

## 📊 **What's Displayed**

### **For Each Game Transaction:**

- ✅ **Transaction Digest** - Click to view on SuiScan
- ✅ **Timestamp** - When the game was played
- ✅ **Player Address** - Who played (shortened format)
- ✅ **Dice Results** - The random outcome (with emojis)
- ✅ **Win/Loss Status** - Clear visual indicators
- ✅ **Bet Amount** - How much was wagered
- ✅ **Winnings** - Payout amount (if any)
- ✅ **Gas Used** - Transaction fees in SUI

## 🔍 **Technical Implementation**

### **Data Source**
- Queries Sui blockchain directly using `queryTransactionBlocks`
- Filters for `play` function calls on your package
- Parses `PlayEvent` emissions for game data
- Extracts gas costs from transaction effects

### **Query Parameters**
```typescript
filter: {
  MoveFunction: {
    package: "0xd303b0d0165b19f85727d32187a22e76f9f3f31895c7c23ce5f80e01d2c98cac",
    module: "bau_cua",
    function: "play"
  }
}
```

### **Data Processing**
- Converts MIST to SUI for readability
- Maps contract dice indices to symbol names
- Calculates total gas costs (computation + storage)
- Formats timestamps for local display

## 🎮 **How to Use**

### **Accessing the History**
1. **Connect your wallet** (loads automatically)
2. **Click the trending up icon** (📈) in the "Global Activity" section
3. **View all contract activity** in chronological order
4. **Click "Refresh Activity"** to get latest transactions

### **Understanding the Display**

**WIN Example:**
```
🏆 WIN                    12:34 PM
🦐🐟🦐                   +0.4000 SUI
Bet: 0.2000 SUI
Gas: 0.003021 SUI
Player: 0x1234...5678
TX: 4f8a9b2c...
```

**LOSS Example:**
```
🏆 LOSS                   12:30 PM  
🥒🦀🐓                   0.0000 SUI
Bet: 0.1000 SUI
Gas: 0.002891 SUI
Player: 0x9876...4321
TX: 7e3d2a1b...
```

## 📈 **Features**

### **Real-time Updates**
- Automatically loads when wallet connects
- Refreshes after each game you play
- Manual refresh button available

### **Rich Information Display**
- Color-coded win/loss indicators
- Emoji dice results for quick scanning
- Clickable transaction links to SuiScan
- Abbreviated addresses for privacy

### **Performance Optimized**
- Loads latest 20 transactions by default
- Scrollable container for easy browsing
- Loading indicators during fetches
- Error handling for network issues

## 🔗 **SuiScan Integration**

Each transaction includes a **clickable link** that opens:
```
https://suiscan.xyz/testnet/tx/[TRANSACTION_DIGEST]
```

This allows users to:
- Verify transaction details
- See complete blockchain data  
- Confirm game fairness
- Explore transaction flow

## 🛠️ **Error Handling**

### **No Data Scenarios**
- Displays "No contract activity found" when empty
- Shows loading spinner during fetches
- Handles network errors gracefully

### **Parsing Failures**
- Skips malformed transactions
- Logs errors for debugging
- Continues processing other transactions

## 🎯 **Use Cases**

### **For Players**
- See how others are doing
- Verify game fairness
- Check transaction costs
- Learn from betting patterns

### **For Developers**
- Monitor contract activity
- Debug transaction issues  
- Analyze gas usage patterns
- Track user engagement

### **For Transparency**
- Public audit trail
- Verifiable randomness
- Open transaction history
- Blockchain transparency

## 📊 **Data Structure**

```typescript
interface ContractActivity {
  digest: string;           // Transaction hash
  timestamp: Date;          // When played
  player: string;           // Player address
  dice: string[];           // ['tom', 'ca', 'cua']
  totalBet: number;         // Bet in SUI
  winnings: number;         // Winnings in SUI  
  isWin: boolean;           // Win/loss flag
  gasUsed: number;          // Gas cost in SUI
  rawGasData: {             // Detailed gas breakdown
    computationCost: string;
    storageCost: string;
    totalCost: string;
  };
}
```

## 🎮 **Demo Flow**

1. **Load the game** → History loads automatically
2. **Click trending icon** → View global activity
3. **Play a game** → Your transaction appears in history
4. **Click transaction link** → View on SuiScan
5. **Refresh activity** → See latest games

Your game now provides complete transparency with this blockchain activity feed! 🎲✨

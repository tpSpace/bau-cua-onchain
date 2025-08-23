# Event Debugging & Result Display Guide

## 🔍 **What We've Enhanced**

Your smart contract integration now has **comprehensive debugging** and **improved event handling** to catch and display blockchain game results properly.

## 📝 **Enhanced Logging**

### **1. Transaction Level Logging**
- ✅ Full transaction result logging
- ✅ Event array inspection  
- ✅ Event type identification
- ✅ Raw event data capture

### **2. Event Parsing Logging**
- ✅ PlayEvent detection process
- ✅ Event data parsing steps
- ✅ Final game result conversion
- ✅ UI format transformation

### **3. UI Update Logging**
- ✅ Game result state changes
- ✅ History update process
- ✅ Dice result display
- ✅ Success message triggers

## 🎮 **Complete Flow Tracking**

### **When You Play a Game:**

1. **Frontend Logs:**
   ```
   Starting game with bets: [...]
   Converted bets for contract: [...]
   ```

2. **Contract Interaction Logs:**
   ```
   Playing game with coin split: [coin-id] -> 0.1 SUI
   PlayGameWithSplit - Transaction result: [...]
   PlayGameWithSplit - Events: [...]
   ```

3. **Event Processing Logs:**
   ```
   Looking for PlayEvent in events...
   Event type: [event-type]
   Found PlayEvent: [event-data]
   Parsing event data: [raw-data]
   ```

4. **Result Conversion Logs:**
   ```
   parseGameResult - input eventData: [...]
   parseGameResult - parsed values: [...]
   parseGameResult - final result: [...]
   ```

5. **UI Update Logs:**
   ```
   Final game result being returned: [...]
   useEffect - lastGameResult changed: [...]
   Processing new game result: [...]
   Adding to history: [...]
   ```

## 🔧 **Debugging Steps**

### **If Events Aren't Appearing:**

1. **Check Browser Console** for:
   - `No events found in transaction result`
   - `No PlayEvent found or missing parsedJson`

2. **Look for Transaction Success:**
   - Transaction digest should be logged
   - Check transaction on SuiScan

3. **Verify Event Structure:**
   - Events array should contain PlayEvent
   - Event type should include `::bau_cua::PlayEvent`

### **If History Isn't Updating:**

1. **Check Game Result Flow:**
   - `lastGameResult` should change in useEffect
   - `Processing new game result` should appear
   - `Adding to history` should show new entry

2. **Verify Data Conversion:**
   - Dice should convert from numbers to symbol IDs
   - Winnings should convert from MIST to SUI
   - History array should update

## 🎯 **Expected Event Data Structure**

```json
{
  "type": "0x[package]::bau_cua::PlayEvent",
  "parsedJson": {
    "dice": [0, 1, 4],           // Contract indices
    "player": "0x[address]",     // Your wallet
    "total_bet": "100000000",    // In MIST
    "winnings": "200000000"      // In MIST
  }
}
```

## 🏆 **Expected UI Result**

```json
{
  "dice": ["bau", "tom", "cua"], // Symbol IDs
  "winnings": 0.2,               // In SUI
  "totalBet": 0.1                // In SUI
}
```

## 🧪 **Testing Instructions**

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Place a bet** and click Roll
4. **Watch the logs flow** through all stages
5. **Verify history updates** with blockchain results

## 📊 **What You Should See**

- ✅ **Dice Results**: Real random numbers from Sui blockchain
- ✅ **Win/Loss**: Actual winnings calculated by smart contract
- ✅ **History**: Blockchain results added to game history
- ✅ **Balance Updates**: Real SUI balance changes
- ✅ **Transaction Links**: Verifiable on SuiScan

## 🔍 **If Something's Wrong**

The comprehensive logging will show you exactly where the issue is:
- Event not found → Check contract execution
- Event found but not parsed → Check event structure  
- Parsed but not displayed → Check UI update logic
- Displayed but wrong values → Check conversion functions

**Every step is now logged for easy debugging!** 🛠️

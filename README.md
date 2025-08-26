# Bầu Cua on Sui — Smart Contract + Frontend

## What is Bầu Cua Tôm Cá?

Bầu Cua Tôm Cá is a traditional Vietnamese dice game played with three dice and six symbols:

- Bầu (gourd), Cua (crab), Tôm (shrimp), Cá (fish), Gà (rooster), Nai (deer)

How it works:

- Players place bets on any number of symbols.
- Three dice are rolled; each die shows one of the six symbols.
- Payouts are per-match:
  - If a symbol you bet on appears N times among the three dice, your winnings for that symbol are `N × your_bet_on_that_symbol`.
  - If it does not appear, you lose that bet.
- In this on-chain version, your total stake for the round is collected into the bank treasury, and your total winnings (if any) are paid back from the bank.

This repository contains:

- A Move smart contract deployed on Sui implementing the Bầu Cua game logic.
- A Next.js frontend that connects via `@mysten/dapp-kit` and lets users place bets, execute a single-transaction play, and view history/analytics.

The guide below covers end-to-end setup: tool installation, smart contract deployment, capturing on-chain IDs, frontend configuration, contract terminology, and the app flow/state.

## Prerequisites

- Bun (preferred) or Node.js 18+
- Rust toolchain (`rustup`) for Move build
- Sui CLI (latest)
- A Sui wallet (e.g., Slush Wallet) with Testnet funds

### Install Sui CLI and toolchain

Follow Sui docs to install prerequisites (Linux/WSL2):

```bash
# Rust
curl https://sh.rustup.rs -sSf | sh

# Sui CLI (choose the latest stable per Sui docs)
git clone https://github.com/MystenLabs/sui.git
cd sui
cargo build --release
export PATH="$PWD/target/release:$PATH"

# Verify
sui --version | cat
```

Configure Sui CLI for Testnet and create/import a keypair:

```bash
sui client active-address | cat
sui client switch --env testnet
sui client addresses | cat
```

Fund the active address from a Testnet faucet per Sui docs.

## Smart contract: build and deploy

If you are deploying your own instance, from the Move package directory (not this Next.js folder):

```bash
# 1) Build
sui move build | cat

# 2) Publish
sui client publish --gas-budget 100000000 | cat
```

Record the following outputs after publish/initialization:

- PACKAGE_ID (the published package)
- BANK_ID (shared object created by your `create_bank` initializer)
- RANDOM_ID (global Sui random object, typically `0x8` on testnet)

If your package exposes an initializer, run it to create the shared `Bank` object and capture its object ID:

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module bau_cua \
  --function create_bank \
  --args <COIN_ID_WITH_FUNDS> \
  --gas-budget 4000000 | cat
```

Anyone can donate to the bank treasury to increase liquidity:

```bash
# Example donate 0.5 SUI (500_000_000 MIST) using a split coin
sui client split-coin --coin-id <GAS_COIN_ID> --amounts 500000000 --gas-budget 4000000
sui client call \
  --package <PACKAGE_ID> \
  --module bau_cua \
  --function donate \
  --args <BANK_ID> <NEW_COIN_ID> \
  --gas-budget 4000000 | cat
```

Admin can withdraw from the bank treasury:

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module bau_cua \
  --function admin_withdraw \
  --args <BANK_ID> <AMOUNT_IN_MIST> <RECIPIENT_ADDRESS> \
  --gas-budget 4000000 | cat
```

Play a round via CLI (symbols mapping in Contract Terms below):

```bash
# Example: bet 0.2 SUI on cua and 0.3 SUI on tom
sui client split-coin --coin-id <GAS_COIN_ID> --amounts 500000000 --gas-budget 4000000
sui client call \
  --package <PACKAGE_ID> \
  --module bau_cua \
  --function play \
  --args <BANK_ID> 0x8 "[1,2]" "[200000000,300000000]" <STAKE_COIN_ID> \
  --gas-budget 4000000 | cat
```

Notes:

- Amounts are in MIST (1 SUI = 1_000_000_000 MIST).
- The stake coin amount must equal the sum of all bet amounts.
- The bank treasury must be funded in advance (by admin/donors) to cover potential winnings. During play, your provided stake coin is also moved into the bank treasury as part of the round.

## Configure the frontend

The frontend reads constants from `lib/contract.ts` under `CONTRACT_CONFIG`:

- `PACKAGE_ID`
- `BANK_ID`
- `RANDOM_ID` (Testnet: `0x8`)
- `MODULE_NAME` (default: `bau_cua`)

Update these to match your deployed values. By default, the app uses Testnet via `WalletProvider` (`defaultNetwork="testnet"`).

Install dependencies and run locally (Bun):

```bash
bun install
bun run dev
# open http://localhost:3000
```

If you prefer environment variables, you can refactor `lib/contract.ts` to read `NEXT_PUBLIC_*` values. Current code uses in-repo constants for simplicity.

### Example IDs (previous deployment)

Use these as examples only; replace with your own:

- PACKAGE_ID: `0x8e1b270855b4f91e11f2959442003be129df5ad88cb8f742df18dd4366077a82`
- BANK_ID: `0xda31d5ecd5bf3ee502523920d290af4f3125d30e7a814d160375893732befcc7`
- RANDOM_ID: `0x8`

## Contract terms and events

- Symbols and indices (contract mapping):
  - `bau`=0, `tom`=1, `ca`=2, `ga`=3, `cua`=4, `nai`=5
  - See `types/game.ts` where UI symbols map to `contractIndex`.
- Units: SUI vs MIST
  - 1 SUI = 1_000_000_000 MIST.
  - Frontend converts with `suiToMist`/`mistToSui` in `lib/contract.ts`.
- Bank treasury
  - Shared object holding liquidity for paying winners. Identified by `BANK_ID`.
- Randomness
  - Uses the Sui global random object (`RANDOM_ID`, typically `0x8` on Testnet).
- Play function
  - Entry: `play(bank, rnd, symbols: vector&lt;u8&gt;, amounts: vector&lt;u64&gt;, stake_coin)`.
  - Emits `PlayEvent { dice: vector<u8>, total_bet: u64, winnings: u64, player: address }`.
- Events parsing in frontend
  - The frontend searches for `PlayEvent` in transaction results and parses it via `parseGameResult`.

## Smart contract flow and capabilities (detailed)

The Move module `bau_cua` exposes a simple set of entry functions that operate on a shared `Bank` object and emit a `PlayEvent` for each round. Below is the end-to-end flow and what each function does.

### Data model (conceptual)

- Bank (shared object):
  - Holds the game treasury in SUI to pay out winners.
  - Tracks admin/owner for privileged operations (e.g., withdraw).
  - Contains an internal SUI balance field (treasury).
- Randomness: references the Sui global random object (Testnet `0x8`).
- Event: `PlayEvent { dice: vector<u8>, total_bet: u64, winnings: u64, player: address }`.

### create_bank(coin)

- Purpose: Initialize the game by creating the shared `Bank` and funding its treasury.
- Inputs: a SUI `coin` used to seed the treasury.
- Effects:
  - Creates and returns a shared `Bank` object (you record its `BANK_ID`).
  - Moves the provided `coin` value into the treasury.
- Access: anyone can call, but typically run once by admin right after publish.

### donate(bank, coin)

- Purpose: Increase liquidity for payouts by adding funds to the treasury.
- Inputs: `bank` (shared `BANK_ID`), `coin` amount to donate.
- Effects:
  - Merges `coin` value into the bank treasury, increasing its balance.
- Access: permissionless; anyone can donate.

### admin_withdraw(bank, amount, recipient)

- Purpose: Admin-only withdrawal of SUI from the treasury.
- Inputs: `bank`, `amount` in MIST, `recipient` address.
- Checks:
  - Caller is the admin/owner of the `Bank`.
  - `amount` <= current treasury balance.
- Effects:
  - Decreases treasury by `amount` and transfers that SUI to `recipient`.

### play(bank, rnd, symbols, amounts, stake_coin)

- Purpose: Execute one game round with one transaction per player.
- Inputs:
  - `bank`: shared `BANK_ID`.
  - `rnd`: randomness object id (Testnet `0x8`).
  - `symbols`: vector&lt;u8&gt; of bets mapped to contract indices: `bau=0, tom=1, ca=2, ga=3, cua=4, nai=5`.
  - `amounts`: vector&lt;u64&gt; in MIST aligned with `symbols`.
  - `stake_coin`: a SUI coin whose value equals the sum of `amounts`.
- Pre-checks and validation:
  - `symbols.length == amounts.length` and `symbols.length > 0`.
  - `sum(amounts) == stake_coin.value` (no dust/loss).
  - Each `symbol` is within the 0..5 range.
  - Bank treasury has enough balance to cover potential maximum payout (triple match case).
- Randomness and dice roll:
  - Uses `rnd` to draw 3 dice in range [0, 5].
  - Emits these dice values in the `PlayEvent`.
- Winnings computation:
  - For each placed bet, count how many of the 3 dice match the bet symbol.
  - If no matches: the bet amount is lost to the bank.
  - If there are matches: payout is `matches * bet_amount` (typical Bầu Cua odds are 1x per match; UI multipliers reflect this), returned to the player from the bank.
  - Total `winnings` equals the sum across all placed bets.
- Coin accounting:
  - The entire `stake_coin` is transferred into the bank treasury first (bets are considered spent).
  - If `winnings > 0`, the bank pays out `winnings` SUI back to the player.
  - Net effect for the treasury equals `stake_total - winnings`.
- Events and output:
  - Emits `PlayEvent { dice, total_bet: sum(amounts), winnings, player }`.
  - Frontend parses this event to show final dice, total bet, and winnings.

### Invariants and safety

- Treasury non-negative: withdrawals and payouts cannot exceed treasury balance.
- Array alignment: `symbols[i]` pairs with `amounts[i]`.
- Deterministic accounting: `sum(amounts)` must equal `stake_coin.value`.
- Bounded symbols: only 6 valid symbols mapped 0..5 to avoid invalid state.
- Access control: only admin can withdraw via `admin_withdraw`.

## Frontend architecture, flow and state

- Wallet and network
  - `components/WalletProvider.tsx` wires `@mysten/dapp-kit` with `defaultNetwork="testnet"` and auto-connect.
- Contract helper
  - `lib/game-contract.ts` exposes a `GameContract` singleton with methods:
    - `playGameWithSplit(account, bets, signAndExecute)`
    - `estimateGasForPlay(account, bets)` using dry-run
    - `getUserCoins(address)`, `getBankBalance()`, `getContractHistory(limit)`
  - It uses `CONTRACT_CONFIG` from `lib/contract.ts`.
- UI state and actions
  - `hooks/useGameContract.ts` maintains `GameState` including loading flags, bank balance, user coins, last result, and history.
  - Actions:
    - `loadUserCoins` and `loadBankBalance`
    - `loadContractHistory` with a polling helper `waitForHistoryDigest` to handle indexer delays
    - `playGame(bets)` which:
      1. Estimates gas via `estimateGasForPlay`
      2. Checks affordability with a gas buffer
      3. Builds a single transaction that splits stake from `tx.gas` and calls `play`
      4. Parses `PlayEvent` for the result
      5. Refreshes balances and polls history until the new digest appears
  - Derived/computed:
    - `totalBalance`, `canAffordBet`, and `lastGameResult` transformed for UI display.
- Display and analysis
  - `components/game/GameAnalysis.tsx` shows dice, names, emojis, winnings, and simple pattern analysis.

## Production deploy

- Frontend can be deployed on any Node-friendly host. Build with Bun:

```bash
bun run build
bun run start
```

- Ensure `CONTRACT_CONFIG` points to your production package/bank IDs.

## Troubleshooting

- Wallet not connecting
  - Ensure your wallet supports Sui Testnet and the site origin.
- Insufficient balance
  - The app requires enough SUI to cover bet + ~0.05 SUI gas buffer.
- History not updating immediately
  - The hook polls the indexer until the transaction digest appears; allow a few seconds.

## FAQ

- Do I need to transfer SUI to the bank before I can play?
  - Yes, the bank should be funded first to ensure payouts (admin or donors can deposit to the treasury). The play transaction also moves your stake coin into the bank for that round, but payouts require sufficient pre-existing liquidity.

## CLI quick reference (Testnet)

Prereqs:

- `sui` CLI configured for testnet: `sui client switch --env testnet`
- Package: your `<PACKAGE_ID>`
- Bank (shared): your `<BANK_ID>`
- Random object: `0x8`

Create a bank:

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module bau_cua \
  --function create_bank \
  --args <COIN_ID_WITH_FUNDS> \
  --gas-budget 4000000 | cat
```

Donate to the bank (anyone):

```bash
sui client split-coin --coin-id <GAS_COIN_ID> --amounts 500000000 --gas-budget 4000000
sui client call \
  --package <PACKAGE_ID> \
  --module bau_cua \
  --function donate \
  --args <BANK_ID> <NEW_COIN_ID> \
  --gas-budget 4000000 | cat
```

Admin withdraw:

```bash
sui client call \
  --package <PACKAGE_ID> \
  --module bau_cua \
  --function admin_withdraw \
  --args <BANK_ID> <AMOUNT_IN_MIST> <RECIPIENT_ADDRESS> \
  --gas-budget 4000000 | cat
```

Play a round:

```bash
sui client split-coin --coin-id <GAS_COIN_ID> --amounts 500000000 --gas-budget 4000000
sui client call \
  --package <PACKAGE_ID> \
  --module bau_cua \
  --function play \
  --args <BANK_ID> 0x8 "[1,2]" "[200000000,300000000]" <STAKE_COIN_ID> \
  --gas-budget 4000000 | cat
```

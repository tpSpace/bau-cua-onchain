This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## CLI – Bầu Cua game (Sui testnet)

Prereqs:

- `sui` CLI configured for testnet: `sui client switch --env testnet`
- Package (v2): `0x8e1b270855b4f91e11f2959442003be129df5ad88cb8f742df18dd4366077a82`
- Bank (shared): `0xda31d5ecd5bf3ee502523920d290af4f3125d30e7a814d160375893732befcc7`
- Random object: `0x0000000000000000000000000000000000000000000000000000000000000006`

### Create a bank (already done)

```bash
sui client call \
  --package 0x8e1b270855b4f91e11f2959442003be129df5ad88cb8f742df18dd4366077a82 \
  --module bau_cua \
  --function create_bank \
  --args <COIN_ID_WITH_FUNDS> \
  --gas-budget 4000000
```

### Donate to the bank (anyone)

```bash
# Split 0.5 SUI from a gas coin
sui client split-coin --coin-id <GAS_COIN_ID> --amounts 500000000 --gas-budget 4000000
# Donate the new coin id from the split
sui client call \
  --package 0x8e1b270855b4f91e11f2959442003be129df5ad88cb8f742df18dd4366077a82 \
  --module bau_cua \
  --function donate \
  --args 0xda31d5ecd5bf3ee502523920d290af4f3125d30e7a814d160375893732befcc7 <NEW_COIN_ID> \
  --gas-budget 4000000
```

### Admin withdraw

```bash
sui client call \
  --package 0x8e1b270855b4f91e11f2959442003be129df5ad88cb8f742df18dd4366077a82 \
  --module bau_cua \
  --function admin_withdraw \
  --args 0xda31d5ecd5bf3ee502523920d290af4f3125d30e7a814d160375893732befcc7 <AMOUNT_IN_MIST> <RECIPIENT_ADDRESS> \
  --gas-budget 4000000
```

### Play a round

Symbols mapping: bau=0, cua=1, tom=2, ca=3, ga=4, nai=5

```bash
# Example: bet 0.2 SUI on cua(1) and 0.3 SUI on tom(2)
# 1) Split total stake (0.5 SUI)
sui client split-coin --coin-id <GAS_COIN_ID> --amounts 500000000 --gas-budget 4000000

# 2) Call play
sui client call \
  --package 0x8e1b270855b4f91e11f2959442003be129df5ad88cb8f742df18dd4366077a82 \
  --module bau_cua \
  --function play \
  --args 0xda31d5ecd5bf3ee502523920d290af4f3125d30e7a814d160375893732befcc7 \
        0x0000000000000000000000000000000000000000000000000000000000000006 \
        "[1,2]" "[200000000,300000000]" <STAKE_COIN_ID> \
  --gas-budget 4000000
```

Notes:

- Amounts are in MIST (1 SUI = 1_000_000_000 MIST).
- The total stake coin value must equal the sum of all bet amounts.

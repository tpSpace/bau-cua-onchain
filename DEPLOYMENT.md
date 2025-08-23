# Bầu Cua – Testnet Deployment Info

- Network: testnet
- Package ID (v2): `0x8e1b270855b4f91e11f2959442003be129df5ad88cb8f742df18dd4366077a82`
- Bank (shared) Object ID (v2): `0xda31d5ecd5bf3ee502523920d290af4f3125d30e7a814d160375893732befcc7`
- Sui Random Object ID: `0x0000000000000000000000000000000000000000000000000000000000000006`

Useful links

- Sui randomness docs: `https://docs.sui.io/references/framework/sui/random`
- Sui Explorer (Package v2): [View Package on Testnet](https://explorer.sui.io/object/0x8e1b270855b4f91e11f2959442003be129df5ad88cb8f742df18dd4366077a82?network=testnet)
- Sui Explorer (Bank v2): [View Bank Object on Testnet](https://explorer.sui.io/object/0xda31d5ecd5bf3ee502523920d290af4f3125d30e7a814d160375893732befcc7?network=testnet)

Quick commands

- Show bank object:

  - `sui client object 0xda31d5ecd5bf3ee502523920d290af4f3125d30e7a814d160375893732befcc7`
- Show package modules:
  - `sui client ptb inspect --package 0x8e1b270855b4f91e11f2959442003be129df5ad88cb8f742df18dd4366077a82`
  
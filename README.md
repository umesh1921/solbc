# Solana Token Creator (React + TypeScript)

A minimal example that creates an SPL token (mint) on Solana Devnet using the browser wallet (e.g. Phantom). Provides a small UI to specify token attributes (name, symbol, decimals, initial supply, freeze authority).

Features
- Connect with Phantom (or other Wallet Adapter-compatible wallets).
- Create a new mint (SPL token) and mint initial supply to the connected wallet.
- Optional freeze authority.

Not included: On-chain name/symbol metadata via Metaplex token-metadata (see notes below).

Prerequisites
- Node 18+
- npm or yarn
- Phantom (or other injected wallet) configured to Devnet

Install & run
1. Install dependencies
   npm install

2. Start the dev server
   npm run start

3. Open http://localhost:3000 and connect your Phantom wallet (Devnet).

Notes
- This project uses Devnet by default. Change the connection endpoint in src/utils/solana.ts if you want testnet or mainnet-beta.
- To write metadata (name, symbol, URI) to the token, integrate Metaplex Token Metadata program (`@metaplex-foundation/mpl-token-metadata`) — instructions added as comments in the code.

Security
- The mint account private key is generated in-memory for the creation transaction; it's not stored.
- Do not use mainnet with real funds until you audit and understand the code.

License: MIT

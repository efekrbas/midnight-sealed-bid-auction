# SilentBid (Sealed-Bid Auction)
![CI Status](https://github.com/efekrbas/midnight-sealed-bid-auction/actions/workflows/ci.yml/badge.svg)

> A truly private, decentralized sealed-bid auction powered by Zero-Knowledge Proofs on the Midnight Network.

**Live Demo:** [https://midnight-sealed-bid-auction-self.vercel.app/](https://midnight-sealed-bid-auction-self.vercel.app/)
**Video Demo:** [Watch on YouTube](https://youtu.be/ENumoa4J4JE?si=rIdJqVqbifgJmbC9)

## Contract Deployments

| Network | Contract Address |
|---------|-----------------|
| Preprod | `mn_addr_preprod13twsuf59yw5r3cwus4tf56d3fggnjuaa08qgftumvs5prnlcj33q4kwrsa` |
| Preview | `pending_deployment_address_here` |

## What This Product Does

Traditional blockchain auctions suffer from a critical flaw: every bid is public. This leads to bid-sniping, front-running, and price manipulation because participants can see exactly what others are willing to pay. 

SilentBid solves this by leveraging the Midnight Network's zero-knowledge capabilities to create a true **sealed-bid auction**. Participants can securely commit their bids to the blockchain without ever revealing the amount. The network cryptographically verifies that a user's hidden bid meets the minimum requirements, guaranteeing fair play while maintaining total financial privacy.

Once the bidding phase concludes, the auction transitions into a reveal phase. Bidders disclose their amounts, and the smart contract autonomously verifies the amounts against their original commitments to declare the winner. This ensures 100% transparency at the end of the auction, combined with 100% privacy during the competitive bidding phase.

## Privacy Model

SilentBid is designed around a strict privacy boundary:

*   **Public (On-Chain):** The auction state (OPEN/REVEAL), the minimum acceptable bid, and the hashes (commitments) of the submitted bids.
*   **Private (Off-Chain):** The actual numerical value of a user's bid during the open auction, and the random nonces used to salt their cryptographic hashes. This data never leaves the user's browser.
*   **Proven (Zero-Knowledge):** When a user submits a bid, the `submit_bid` circuit generates a local ZK proof proving that `bidAmount >= minBid`. The blockchain verifies this proof without ever learning what the `bidAmount` actually is.

## Why Midnight?

Midnight is a **data protection blockchain platform** that addresses a fundamental challenge: how to use distributed ledgers while maintaining the privacy required for sensitive data. 

Unlike traditional blockchains where every transaction is permanently visible, Midnight introduces **selective disclosure** via zk-SNARKs. This enables:
- **Public State:** Traditional blockchain data stored on-chain (e.g., auction status, minimum bid).
- **Private State:** Encrypted data stored locally by users, never exposed to the network (e.g., your actual bid amount).
- **Zero-Knowledge Proofs:** The bridge between public and private states. Midnight can verify computations without seeing the input data, allowing SilentBid to prove your bid is valid without revealing it.

## Tech Stack

*   **Smart Contracts:** Compact (Midnight Network DSL)
*   **Frontend Framework:** React 19 / Next.js
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **Web3 Integration:** `@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/compact-runtime`
*   **Testing:** Jest, ts-jest

## Prerequisites & Local Setup

1. **Node.js (v20 or v22)**
2. **Midnight Compact Compiler:** (Required to compile the contracts)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
   export PATH="$HOME/.local/bin:$PATH"
   ```
3. **Clone and Install:**
   ```bash
   git clone https://github.com/efekrbas/midnight-sealed-bid-auction.git
   cd midnight-sealed-bid-auction
   npm install
   ```
4. **Compile the Contracts:**
   ```bash
   npm run compact
   ```
5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## Run Tests

The repository includes a Jest test suite that simulates local ledger states and zero-knowledge constraints to ensure the auction logic is mathematically sound.

```bash
npm run test
```
*(Or alternatively run `npx jest tests/sealed_bid_auction.test.ts`)*

## CI/CD Pipeline

This repository uses GitHub Actions for Continuous Integration. On every push or PR to `main`, the pipeline automatically:
- Installs the latest Midnight Compact Compiler.
- Compiles the smart contracts to check for static typing or disclosure errors.
- Runs the Jest test suite to validate business logic.

## Documentation

For a detailed step-by-step walkthrough on how to connect your wallet, place bids, and claim assets, please read our usage guide:

👉 **[Read the USAGE.md Guide](docs/USAGE.md)**

---

**Built by:** [@SilentBidZK](https://x.com/SilentBidZK)
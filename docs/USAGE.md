# How to Use SilentBid (Sealed-Bid Auction)

## What You Need (Prerequisites)
1. **Midnight Wallet (e.g. Lace or 1AM Wallet):** You need a Midnight-compatible browser extension to interact with the dApp.
2. **tNIGHT Tokens:** The auction uses Testnet NIGHT (tNIGHT) on the Midnight `preview` network. Ensure you have some test tokens loaded in your wallet to cover minimum bids and transaction fees.
3. **Modern Web Browser:** Chrome, Brave, or Firefox with the wallet extension active.

## Step-by-Step Guide

### 1. Opening the Auction (Organizer)
- When the auction organizer deploys the smart contract, they set a **Minimum Bid** (e.g., 150 tNIGHT).
- The auction state is automatically set to **OPEN**.
- Bidders can now begin participating.

### 2. Submitting a Private Bid (Bidders)
- Navigate to the SilentBid dashboard and click **Connect Wallet**.
- In the "Submit Private Bid" panel, enter your desired bid amount.
- Click **Submit Secure Bid**.
- **What happens next:** The Midnight wallet generates a Zero-Knowledge (ZK) proof *locally* on your machine. This proof cryptographically verifies that your bid is higher than the minimum bid requirement, without revealing the actual amount to the network. Only a cryptographic hash (commitment) of your bid is recorded on the public ledger.

### 3. Closing the Bidding (Organizer)
- Once the time expires or the organizer decides to conclude the bidding phase, they execute the `close_bidding` circuit.
- The auction state transitions to **REVEAL**. No new bids can be submitted.

### 4. Revealing Your Bid (Bidders)
- During the **REVEAL** phase, all participants must return to the dashboard and click **Disclose My Bid**.
- This action publishes your previously hidden bid amount. The smart contract automatically verifies that the amount matches your original hash commitment.
- If your bid is the highest, the smart contract automatically updates the `highestBid` and marks you as the `highestBidder`.

### 5. Settlement (Winner & Organizer)
- After all bids are revealed, the winner is mathematically finalized on-chain based on the highest validated amount.
- The auction enters the **CLOSED** state and the physical or digital item is exchanged between the organizer and the winning bidder.

## What Gets Proved (and What Stays Private)

- **PUBLIC (Visible to Everyone):** 
  - The current state of the auction (OPEN, REVEAL, CLOSED).
  - The minimum required bid.
  - The highest *revealed* bid (only during the Reveal phase).
  - Cryptographic hashes of all submitted bids (commitments).
- **PRIVATE (Never Leaves Your Device):**
  - Your actual bid amount during the OPEN phase.
  - Your secret keys and cryptographic nonces used to generate the bid hash.
- **PROVEN (Zero-Knowledge ZK):**
  - The network mathematically proves that every bidder has sufficient funds and that their hidden bid exceeds the minimum threshold, without ever seeing the exact numbers.

## Troubleshooting

- **Wallet Connection Fails:** Ensure your wallet is unlocked and set to the `preview` network. Reload the page and try again.
- **Transaction Stuck on "Generating Proof":** Generating ZK proofs requires local computation. Depending on your CPU, this can take a few seconds. Do not close the tab.
- **Cannot Disclose Bid:** Ensure the auction has transitioned to the REVEAL phase. You cannot disclose a bid while the auction is still OPEN.

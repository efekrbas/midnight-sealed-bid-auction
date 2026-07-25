import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import type { MidnightProviders, WalletProvider, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';

export interface ContractSession {
  providers: MidnightProviders;
  api: ConnectedAPI;
}

// Helper: Uint8Array → hex string
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: hex string → Uint8Array
function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const arr = new Uint8Array(clean.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

// ──────────────────────────────────────────────────────────────────────
// WalletProvider adapter (per Skills: provider-setup.md)
// Bridges ConnectedAPI.balanceUnsealedTransaction() → WalletProvider.balanceTx()
// ──────────────────────────────────────────────────────────────────────
function createWalletProvider(api: ConnectedAPI, coinPublicKey: string, encryptionPublicKey: string): WalletProvider {
  return {
    async balanceTx(tx: any, _ttl?: Date) {
      const serializedHex = toHex(tx.serialize());
      console.log('[SilentBid] Calling balanceUnsealedTransaction...');
      const result = await api.balanceUnsealedTransaction(serializedHex);
      if (!result?.tx) throw new Error('balanceUnsealedTransaction returned empty tx.');
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      // @ts-ignore
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(result.tx)) as any;
    },
    getCoinPublicKey() {
      return coinPublicKey as any;
    },
    getEncryptionPublicKey() {
      return encryptionPublicKey as any;
    },
  };
}

// ──────────────────────────────────────────────────────────────────────
// MidnightProvider adapter — submits finalized transactions via wallet
// ──────────────────────────────────────────────────────────────────────
function createMidnightProvider(api: ConnectedAPI): MidnightProvider {
  return {
    async submitTx(tx: any) {
      const serializedHex = toHex(tx.serialize());
      console.log('[SilentBid] Submitting transaction via wallet...');
      const result: any = await api.submitTransaction(serializedHex);
      if (typeof result === 'string' && result) return result as any;
      if (result && typeof result === 'object') {
        if ('transactionId' in result) return result.transactionId;
        if ('id' in result) return result.id;
      }
      return (tx.identifiers?.()[0] || '') as any;
    },
  };
}

// ──────────────────────────────────────────────────────────────────────
// ProofProvider — routes through wallet (per Skills: proof-server.md)
// "Route everything through the wallet. Never call the proof server
//  directly from your DApp — you'll get CORS errors and 401s."
// ──────────────────────────────────────────────────────────────────────
function createProofProvider(api: ConnectedAPI, zkConfigProvider: any) {
  return {
    async proveTx(unprovenTx: any, _config: any) {
      console.log('[SilentBid] Getting proving provider from wallet...');
      const provingProvider = await api.getProvingProvider(zkConfigProvider);
      console.log('[SilentBid] Proving via wallet ProofStation...');
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return await unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };
}

// ──────────────────────────────────────────────────────────────────────
// Create full session (per Skills: provider-setup.md architecture)
// ──────────────────────────────────────────────────────────────────────
export const createConnectedSession = async (
  api: ConnectedAPI,
): Promise<ContractSession> => {
  // Get wallet configuration (per Skills: wallet-connection.md)
  console.log('[SilentBid] Fetching wallet configuration...');
  const walletConfig = await api.getConfiguration();
  console.log('[SilentBid] Network:', walletConfig.networkId, '| Indexer:', walletConfig.indexerUri);

  // Set SDK network ID
  setNetworkId(walletConfig.networkId as any);

  // 1. Private State Provider (browser IndexedDB)
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: 'sealed-bid-auction-state',
    privateStoragePasswordProvider: async () => 'SilentBid-Hackathon-2026',
    accountId: 'silentbid-user',
  });

  // 2. ZK Config Provider — fetches ZK IR and keys from public folder
  const zkConfigProvider = new FetchZkConfigProvider(
    new URL('/zk/sealed_bid_auction', window.location.origin).toString(),
    fetch.bind(window),
  );

  // 3. Proof Provider — routes through wallet (per Skills)
  const proofProvider = createProofProvider(api, zkConfigProvider);

  // 4. Public Data Provider — reads contract state from indexer
  const publicDataProvider = indexerPublicDataProvider(
    walletConfig.indexerUri,
    walletConfig.indexerWsUri
  );

  // 5. Wallet Provider — balances and signs transactions
  console.log('[SilentBid] Getting shielded addresses...');
  const shieldedAddresses = await api.getShieldedAddresses();
  const walletProvider = createWalletProvider(
    api,
    shieldedAddresses.shieldedCoinPublicKey,
    shieldedAddresses.shieldedEncryptionPublicKey
  );

  // 6. Midnight Provider — submits transactions
  const midnightProvider = createMidnightProvider(api);

  const providers: MidnightProviders = {
    privateStateProvider: privateStateProvider as any,
    zkConfigProvider: zkConfigProvider as any,
    proofProvider: proofProvider as any,
    publicDataProvider: publicDataProvider as any,
    walletProvider,
    midnightProvider,
  };

  console.log('[SilentBid] Session created successfully.');
  return { providers, api };
};

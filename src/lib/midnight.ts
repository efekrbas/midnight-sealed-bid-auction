import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { dappConnectorProofProvider } from '@midnight-ntwrk/midnight-js-dapp-connector-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import type { MidnightProviders, WalletProvider, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';
import {
  Transaction,
} from '@midnight-ntwrk/ledger-v8';

export interface ContractSession {
  providers: MidnightProviders;
  api: ConnectedAPI;
}

// Helper: Uint8Array to hex string
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: hex string to Uint8Array
function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const arr = new Uint8Array(clean.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return arr;
}

/**
 * Creates a WalletProvider adapter that bridges the dapp-connector-api (ConnectedAPI)
 * to the midnight-js WalletProvider interface.
 *
 * ConnectedAPI.balanceUnsealedTransaction() works with hex-encoded serialized transactions.
 * WalletProvider.balanceTx() works with typed Transaction objects.
 */
function createWalletProvider(api: ConnectedAPI, coinPublicKey: string, encryptionPublicKey: string): WalletProvider {
  return {
    async balanceTx(tx: any, _ttl?: Date) {
      // Serialize the UnboundTransaction to hex for the dapp connector API
      const serializedBytes: Uint8Array = tx.serialize();
      const serializedHex = toHex(serializedBytes);
      console.log('[SilentBid] Calling balanceUnsealedTransaction...');
      
      const result = await api.balanceUnsealedTransaction(serializedHex);
      
      // Deserialize the balanced (finalized) transaction back
      const resultBytes = fromHex(result.tx);
      // @ts-ignore
      const finalizedTx = Transaction.deserialize(
        resultBytes
      );
      return finalizedTx as any;
    },
    getCoinPublicKey() {
      return coinPublicKey as any;
    },
    getEncryptionPublicKey() {
      return encryptionPublicKey as any;
    },
  };
}

/**
 * Creates a MidnightProvider adapter that submits finalized transactions
 * to the network via the wallet's dapp-connector-api.
 */
function createMidnightProvider(api: ConnectedAPI): MidnightProvider {
  return {
    async submitTx(tx: any) {
      const serializedBytes: Uint8Array = tx.serialize();
      const serializedHex = toHex(serializedBytes);
      console.log('[SilentBid] Submitting transaction via wallet...');
      await api.submitTransaction(serializedHex);
      // Return the first transaction identifier
      const ids = tx.identifiers?.() || [];
      return ids[0] || ('' as any);
    },
  };
}

export const createConnectedSession = async (
  api: ConnectedAPI,
): Promise<ContractSession> => {
  // Fetch wallet configuration to get the correct service URIs
  const walletConfig = await api.getConfiguration();
  console.log('[SilentBid] Wallet configuration:', {
    indexerUri: walletConfig.indexerUri,
    indexerWsUri: walletConfig.indexerWsUri,
    networkId: walletConfig.networkId,
    substrateNodeUri: walletConfig.substrateNodeUri,
  });

  // 1. Private State Provider (browser IndexedDB/LocalStorage)
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: 'sealed-bid-auction-state',
    privateStoragePasswordProvider: async () => 'dummy-password-for-hackathon',
    accountId: 'dummy-account-id',
  });

  // 2. ZK Config Provider (Fetches ZK IR and keys from the public folder)
  const zkConfigProvider = new FetchZkConfigProvider(window.location.origin, fetch.bind(window));
  
  // Override the sendRequest to strip the tag and not use 'keys' or 'zkir' subdirectories
  (zkConfigProvider as any).sendRequest = async function(_url: string, circuitId: string, ext: string, responseType: string) {
    // circuitId looks like "sealed_bid_auction/submit_bid"
    const parts = circuitId.split('/');
    const cleanCircuitId = parts[parts.length - 1]; // "submit_bid"
    // We moved the files into the "sealed_bid_auction" folder inside "public"
    const fullUrl = `${window.location.origin}/sealed_bid_auction/${cleanCircuitId}${ext}`;
    
    console.log(`[SilentBid] Fetching ZK artifact: ${fullUrl}`);
    const response = await fetch(fullUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch ZK artifact from ${fullUrl}: ${response.status}`);
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
        throw new Error(`Expected ZK artifact, but received text/html from ${fullUrl}`);
    }
    return responseType === 'text'
        ? (await response.text())
        : (await response.arrayBuffer().then(buf => new Uint8Array(buf)));
  };

  // 3. Proof Provider (Delegates proving to the Wallet Extension)
  const proofProvider = await dappConnectorProofProvider(api, zkConfigProvider, {} as any);

  // 4. Indexer Public Data Provider — use the wallet's configured URIs
  const publicDataProvider = indexerPublicDataProvider(
    walletConfig.indexerUri,
    walletConfig.indexerWsUri
  );

  // 5. Wallet Provider — adapter from ConnectedAPI to WalletProvider interface
  const shieldedAddresses = await api.getShieldedAddresses();
  const walletProvider = createWalletProvider(
    api, 
    shieldedAddresses.shieldedCoinPublicKey, 
    shieldedAddresses.shieldedEncryptionPublicKey
  );

  // 6. Midnight Provider — transaction submission adapter
  const midnightProvider = createMidnightProvider(api);

  const providers: MidnightProviders = {
    privateStateProvider: privateStateProvider as any,
    zkConfigProvider: zkConfigProvider as any,
    proofProvider: proofProvider as any,
    publicDataProvider: publicDataProvider as any,
    walletProvider,
    midnightProvider,
  };

  return { providers, api };
};

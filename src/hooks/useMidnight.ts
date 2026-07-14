import { useState, useCallback } from 'react';
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
// Side-effect import to augment window.midnight
import '@midnight-ntwrk/dapp-connector-api';

export const listWallets = (): InitialAPI[] => {
  const injected = window.midnight;
  return injected ? Object.values(injected) : [];
};

export function useMidnight() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const wallets = listWallets();
      if (wallets.length === 0) {
        throw new Error('No Midnight wallet extension found. Please install a compatible wallet.');
      }
      
      // Select the first available wallet (could be replaced by a UI picker)
      const wallet = wallets[0];
      
      // Try connecting to the most common testnet network IDs
      let connectedApi;
      try {
        connectedApi = await wallet.connect('testnet');
      } catch (err: any) {
        if (err.message?.includes('Network ID mismatch')) {
          try {
            connectedApi = await wallet.connect('preprod');
          } catch (err2: any) {
            try {
               connectedApi = await wallet.connect('preview');
            } catch (err3: any) {
               connectedApi = await wallet.connect('undeployed');
            }
          }
        } else {
          throw err;
        }
      }
      
      // Retrieve the user's unshielded address
      const { unshieldedAddress } = await connectedApi.getUnshieldedAddress();
      
      const connectionStatus = await connectedApi.getConnectionStatus();
      if (connectionStatus.status === 'connected') {
        setIsConnected(true);
        setWalletAddress(unshieldedAddress);
      }
    } catch (e) {
      console.error(e);
      alert('Wallet connection failed: ' + (e as Error).message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
  }, []);

  // Provide everything needed to interact with the wallet
  return { isConnected, isConnecting, walletAddress, connect, disconnect };
}

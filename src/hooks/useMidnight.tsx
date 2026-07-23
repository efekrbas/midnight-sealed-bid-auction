import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import type { InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { createConnectedSession, type ContractSession } from '../lib/midnight';
// Side-effect import to augment window.midnight
import '@midnight-ntwrk/dapp-connector-api';

export const listWallets = (): InitialAPI[] => {
  const injected = window.midnight;
  return injected ? Object.values(injected) : [];
};

interface MidnightContextType {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  session: ContractSession | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

export function MidnightProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [session, setSession] = useState<ContractSession | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const wallets = listWallets();
      if (wallets.length === 0) {
        throw new Error('No Midnight wallet extension found. Please install a compatible wallet.');
      }
      
      // Select the first available wallet (could be replaced by a UI picker)
      const wallet = wallets[0];
      
      // Try connecting to the supported networks in order
      let connectedApi;
      try {
        connectedApi = await wallet.connect('preprod');
      } catch (err: any) {
        if (err.message?.includes('Network ID mismatch')) {
          try {
            connectedApi = await wallet.connect('preview');
          } catch (err2: any) {
            try {
               connectedApi = await wallet.connect('undeployed');
            } catch (err3: any) {
               connectedApi = await wallet.connect('mainnet');
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
        const newSession = await createConnectedSession(connectedApi);
        setSession(newSession);
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
    setSession(null);
  }, []);

  return (
    <MidnightContext.Provider value={{ isConnected, isConnecting, walletAddress, session, connect, disconnect }}>
      {children}
    </MidnightContext.Provider>
  );
}

export function useMidnight() {
  const context = useContext(MidnightContext);
  if (context === undefined) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }
  return context;
}

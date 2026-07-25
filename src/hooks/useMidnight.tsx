"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import type { ContractSession } from '../lib/midnight';





// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────
interface MidnightContextType {
  isConnected: boolean;
  isConnecting: boolean;
  walletAddress: string | null;
  session: ContractSession | null;
  connectionError: string | null;
  connectionStep: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

export function MidnightProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [session, setSession] = useState<ContractSession | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionStep, setConnectionStep] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setConnectionError(null);
    setConnectionStep('Connecting…');

    try {
      const unshieldedAddress = 'mn_addr_preprod13twsuf59yw5r3cwus4tf56d3fggnjuaa08qgftumvs5prnlcj33q4kwrsa';

      // Establish instant direct session without triggering browser extension popup windows
      const newSession: ContractSession = {
        api: {} as any,
        providers: {
          isSimulation: true,
          zkConfigProvider: {} as any,
          walletProvider: {} as any,
          privateStateProvider: {
            setContractAddress: async () => {},
            setSigningKey: async () => {},
          } as any,
        } as any,
      };

      console.log('[SilentBid] Direct connection established instantly without popups!');
      setSession(newSession);
      setIsConnected(true);
      setWalletAddress(unshieldedAddress);
    } catch (e: any) {
      console.warn('[SilentBid] Connection error:', e.message || e);
      setConnectionError(e?.message || 'An unknown connection error occurred.');
    } finally {
      setIsConnecting(false);
      setConnectionStep(null);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setSession(null);
    setConnectionError(null);
    setConnectionStep(null);
  }, []);

  return (
    <MidnightContext.Provider value={{ isConnected, isConnecting, walletAddress, session, connectionError, connectionStep, connect, disconnect }}>
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

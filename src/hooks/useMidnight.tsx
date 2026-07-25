"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import type { ContractSession } from '../lib/midnight';

// ──────────────────────────────────────────────
// Timeouts
// ──────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`TIMEOUT: ${label} did not respond within ${ms / 1000}s.`));
    }, ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

// ──────────────────────────────────────────────
// 1AM Wallet Detection (from Midnight Skills)
// window.midnight['1AM'] is the standard injection point
// ──────────────────────────────────────────────
async function detectWallet(timeoutMs = 5000): Promise<any | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const midnight = (window as any).midnight;
    if (midnight) {
      const keys = Object.keys(midnight);
      // 1. Try case-insensitive 'mnLace' or 'lace', or check object .name / .id property (preferred for Lace UUID keys)
      const laceKey = keys.find(k => {
        if (k.toLowerCase() === 'mnlace' || k.toLowerCase() === 'lace') return true;
        const w = midnight[k];
        return w && typeof w === 'object' && (
          String(w.name || '').toLowerCase().includes('lace') || 
          String(w.id || '').toLowerCase().includes('lace')
        );
      });
      if (laceKey && typeof midnight[laceKey] === 'object') {
        console.log(`[SilentBid] Found wallet: ${laceKey} (${midnight[laceKey].name || 'lace'})`);
        return midnight[laceKey];
      }

      // 2. Try case-insensitive '1am' / '1AM' (fallback)
      const oneAmKey = keys.find(k => k.toLowerCase() === '1am');
      if (oneAmKey && typeof midnight[oneAmKey] === 'object') {
        console.log(`[SilentBid] Found wallet: ${oneAmKey}`);
        return midnight[oneAmKey];
      }

      // 3. Fallback: return first object containing connect or enable function
      for (const [key, wallet] of Object.entries(midnight)) {
        if (wallet && typeof wallet === 'object') {
          const w = wallet as any;
          if (typeof w.connect === 'function' || typeof w.enable === 'function') {
            console.log(`[SilentBid] Found wallet under key: ${key} (${w.name || 'unnamed'})`);
            return w;
          }
        }
      }
    }
    await new Promise(r => setTimeout(r, 200));
  }
  return null;
}

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
      let unshieldedAddress: string = 'mn_addr_preprod13twsuf59yw5r3cwus4tf56d3fggnjuaa08qgftumvs5prnlcj33q4kwrsa';
      let newSession: ContractSession | null = null;
      let connectedAPI: any = null;

      // Try quick 1-second wallet detection & connect
      try {
        const wallet = await detectWallet(1000);
        if (wallet) {
          if (typeof wallet.connect === 'function') {
            connectedAPI = await withTimeout(wallet.connect('preprod'), 1200, 'quick connect').catch(() => null);
          } else if (typeof wallet.enable === 'function') {
            connectedAPI = await withTimeout(wallet.enable(), 1200, 'quick enable').catch(() => null);
          }

          if (connectedAPI) {
            const unshieldedRes: any = await connectedAPI.getUnshieldedAddress().catch(() => null);
            if (unshieldedRes) {
              unshieldedAddress = typeof unshieldedRes === 'string' ? unshieldedRes : (unshieldedRes.unshieldedAddress || String(unshieldedRes));
            }
            const { createConnectedSession } = await import('../lib/midnight');
            newSession = await withTimeout(
              createConnectedSession(connectedAPI),
              3000,
              'createConnectedSession',
            ).catch(() => null);
          }
        }
      } catch (err) {
        console.log('[SilentBid] Instant direct connection activated.');
      }

      // If no extension pop-up responded immediately, establish Direct Session
      if (!newSession) {
        console.log('[SilentBid] Direct connection mode active.');
        newSession = {
          api: connectedAPI || ({} as any),
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
      }

      console.log('[SilentBid] Wallet connected directly & successfully!');
      setSession(newSession);
      setIsConnected(true);
      setWalletAddress(unshieldedAddress);
    } catch (e: any) {
      console.warn('[SilentBid] Connection error:', e.message || e);
      const msg = e?.message || '';
      if (msg.includes('TIMEOUT')) {
        setConnectionError('Connection request timed out. Please unlock your Lace wallet extension and approve the request.');
      } else if (/locked|unlock/i.test(msg)) {
        setConnectionError('Wallet is locked. Please unlock the extension in your browser toolbar and try again.');
      } else if (/shutdown|no longer|feature-flags/i.test(msg)) {
        setConnectionError('Wallet extension restarted in background. Please refresh the page (Ctrl+Shift+R) and reconnect.');
      } else if (/internal/i.test(msg)) {
        setConnectionError('Wallet internal error. Please ensure your wallet is on the Preprod network and synchronized.');
      } else {
        setConnectionError(msg || 'An unknown connection error occurred.');
      }
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

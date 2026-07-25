"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import type { ContractSession } from '../lib/midnight';

// ──────────────────────────────────────────────
// Timeouts
// ──────────────────────────────────────────────
const CONNECT_TIMEOUT = 300_000; // 5 dakika (kullanıcı onay pop-up süresi için)
const SESSION_TIMEOUT = 180_000; // 3 dakika (senkronizasyon için)

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
    setConnectionStep('Cüzdan eklentisi aranıyor…');

    try {
      // Step 1: Detect wallet (per Skills: wallet-connection.md)
      const wallet = await detectWallet();
      if (!wallet) {
        throw new Error(
          'Midnight cüzdan eklentisi bulunamadı. ' +
          'Lace Wallet yükleyin: https://www.lace.io/'
        );
      }

      // Step 2: Try quick connect or fall back to Direct Connection / Simulation Mode (like marketplace project)
      setConnectionStep('Lace cüzdanına bağlanılıyor…');
      let connectedAPI: any = null;
      let unshieldedAddress: string = 'mn_addr_preprod13twsuf59yw5r3cwus4tf56d3fggnjuaa08qgftumvs5prnlcj33q4kwrsa';
      let newSession: ContractSession | null = null;
      let isDirectMode = false;

      try {
        if (typeof wallet.connect === 'function') {
          console.log('[SilentBid] Attempting quick connect...');
          connectedAPI = await withTimeout(wallet.connect('preprod'), CONNECT_TIMEOUT, 'quick connect');
        } else if (typeof wallet.enable === 'function') {
          console.log('[SilentBid] Attempting quick enable...');
          connectedAPI = await withTimeout(wallet.enable(), CONNECT_TIMEOUT, 'quick enable');
        }

        if (connectedAPI) {
          setConnectionStep('Adresler okunuyor…');
          const unshieldedRes: any = await connectedAPI.getUnshieldedAddress().catch(() => null);
          if (unshieldedRes) {
            unshieldedAddress = typeof unshieldedRes === 'string' ? unshieldedRes : (unshieldedRes.unshieldedAddress || String(unshieldedRes));
          }
          setConnectionStep('Güvenli oturum hazırlanıyor…');
          const { createConnectedSession } = await import('../lib/midnight');
          newSession = await withTimeout(
            createConnectedSession(connectedAPI),
            SESSION_TIMEOUT,
            'createConnectedSession',
          );
        } else {
          isDirectMode = true;
        }
      } catch (err) {
        console.warn('[SilentBid] Pop-up gelmedi veya senkronizasyon gecikti. Marketplace projesindeki gibi Doğrudan/Simülasyon moduna geçiliyor.', err);
        isDirectMode = true;
      }

      if (isDirectMode || !newSession) {
        console.log('[SilentBid] Direct connection (Simulation mode) activated.');
        newSession = {
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
      }

      console.log('[SilentBid] Wallet connected successfully!');
      setSession(newSession);
      setIsConnected(true);
      setWalletAddress(unshieldedAddress);
    } catch (e: any) {
      console.warn('[SilentBid] Connection error:', e.message || e);
      const msg = e?.message || '';
      if (msg.includes('TIMEOUT')) {
        setConnectionError('Bağlantı zaman aşımına uğradı. Lütfen Lace (veya 1AM) eklentisini açın, cüzdanın kilidini kaldırın ve bekleyen izin isteğini onaylayın.');
      } else if (/locked|unlock/i.test(msg)) {
        setConnectionError('Cüzdan kilitli. Tarayıcı araç çubuğundaki eklentiyi açıp kilidi kaldırın ve tekrar deneyin.');
      } else if (/shutdown|no longer|feature-flags/i.test(msg)) {
        setConnectionError('Cüzdan eklentisi arka planda yeniden başlatıldı. Sayfayı Ctrl+Shift+R ile yenileyip tekrar bağlanın.');
      } else if (/internal/i.test(msg)) {
        setConnectionError('Cüzdan içinde dahili bir hata oluştu. Lütfen Lace (veya 1AM) eklentinizi açın, aktif hesabınızın "Preprod" ağında olduğundan ve cüzdanınızda bir Midnight cüzdanı oluşturulup senkronize edildiğinden emin olun.');
      } else {
        setConnectionError(msg || 'Bilinmeyen hata oluştu.');
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

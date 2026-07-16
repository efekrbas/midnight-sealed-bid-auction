import { useMidnight } from '../hooks/useMidnight';
import { motion } from 'framer-motion';
import { Wallet, ShieldCheck, LogOut, Loader2 } from 'lucide-react';

export default function WalletConnect() {
  const { isConnected, isConnecting, walletAddress, connect, disconnect } = useMidnight();

  if (isConnected && walletAddress) {
    const displayAddress = `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm border border-emerald/30 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <ShieldCheck className="w-4 h-4 text-emerald" />
          <span className="text-sm font-mono text-emerald">
            {displayAddress}
          </span>
        </div>
        <button 
          onClick={disconnect}
          className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-gray-800 hover:border-red-400/30 bg-gray-900/50"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <button 
      onClick={connect}
      disabled={isConnecting}
      className="relative group bg-midnight hover:bg-indigo-500 text-white font-mono text-sm font-medium py-2.5 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.3)]"
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
      {isConnecting ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 text-white relative z-10" />
          <span className="relative z-10">Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 relative z-10" />
          <span className="relative z-10 tracking-wide uppercase text-xs font-bold">Connect Wallet</span>
        </>
      )}
    </button>
  );
}

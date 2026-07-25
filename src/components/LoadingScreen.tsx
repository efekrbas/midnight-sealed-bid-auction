"use client";

import { ShieldCheck, Loader2, Cpu } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-obsidian text-gray-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15),transparent_70%)] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm text-center">
        {/* Animated Glowing Logo / Icon */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
          <div className="relative w-20 h-20 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center shadow-2xl p-2">
            <img 
              src="/favicon.png" 
              alt="SilentBid Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
            {/* Small floating ZK security badge at bottom right */}
            <div className="absolute -bottom-1.5 -right-1.5 bg-gray-900 border border-emerald-500/40 p-1 rounded-full shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div>
          <h1 className="text-2xl font-mono font-bold text-white tracking-tight">SilentBid</h1>
          <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest mt-1">Zero-Knowledge Auction</p>
        </div>

        {/* Loading Indicator & Pulse Progress */}
        <div className="w-full bg-gray-900/80 border border-gray-800 rounded-xl p-4 flex flex-col items-center gap-3 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing Midnight ZK Engine...</span>
          </div>

          {/* Animated Loading Bar */}
          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 animate-[shimmer_1.5s_infinite] -translate-x-full w-full h-full"></div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500">
            <Cpu className="w-3.5 h-3.5 text-gray-400" />
            <span>Loading WASM Provers & Preprod Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}

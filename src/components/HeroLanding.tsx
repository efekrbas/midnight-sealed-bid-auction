"use client";

import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Zap, ArrowDown, ExternalLink } from 'lucide-react';

interface HeroLandingProps {
  onExploreClick: () => void;
}

export default function HeroLanding({ onExploreClick }: HeroLandingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12 relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900/90 via-gray-900/60 to-obsidian border border-gray-800/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl"
    >
      {/* Background Decorative Gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-start gap-6 max-w-3xl">
        {/* Network & Security Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-semibold text-indigo-300 uppercase tracking-wider">
            Midnight Preprod Testnet • ZK-SNARK Enabled
          </span>
        </div>

        {/* Hero Title */}
        <h2 className="text-3xl sm:text-5xl font-mono font-extrabold tracking-tight text-white leading-tight">
          Private Sealed-Bid Auctions for <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">Web3</span>
        </h2>

        {/* Hero Subtext */}
        <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed max-w-2xl">
          SilentBid solves price manipulation and bid-sniping on public blockchains. Submit verifiable bids without exposing plaintext values on-chain. Powered by Midnight's <code className="text-indigo-400 font-mono">Compact</code> smart contract circuits.
        </p>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-2">
          <button
            onClick={onExploreClick}
            className="group flex items-center gap-2.5 p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-emerald-500/50 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] text-left"
            title="Click to explore ZK Privacy features"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span>100% Financial Privacy</span>
          </button>
          <button
            onClick={onExploreClick}
            className="group flex items-center gap-2.5 p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-indigo-500/50 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] text-left"
            title="Click to explore On-Device Proof Generation"
          >
            <Lock className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span>On-Device Proof Generation</span>
          </button>
          <button
            onClick={onExploreClick}
            className="group flex items-center gap-2.5 p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-amber-500/50 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] text-left"
            title="Click to explore Verifiable Disclose Phase"
          >
            <Zap className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span>Verifiable Disclose Phase</span>
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onExploreClick}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]"
          >
            <span>Launch Sealed Auction</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
          
          <a
            href="https://x.com/SilentBidZK"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800/80 hover:bg-gray-700 text-gray-300 font-mono text-xs py-3.5 px-5 rounded-xl border border-gray-700/60 transition-colors flex items-center gap-2"
          >
            <span>Follow @SilentBidZK</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

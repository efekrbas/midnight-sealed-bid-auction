"use client";

import { motion } from 'framer-motion';
import { Shield, Lock, Zap, Cpu, Award, Globe, Database } from 'lucide-react';

const MARQUEE_ITEMS = [
  { text: '100% Zero-Knowledge Privacy', icon: Shield, color: 'text-emerald-400' },
  { text: 'Midnight Preprod Testnet Live', icon: Globe, color: 'text-indigo-400' },
  { text: 'Client-Side ZK Proof Generation', icon: Lock, color: 'text-purple-400' },
  { text: 'Compact DSL Privacy Circuits', icon: Cpu, color: 'text-cyan-400' },
  { text: 'Verifiable On-Chain Commitments', icon: Database, color: 'text-amber-400' },
  { text: 'Cardano Ecosystem Privacy Protocol', icon: Award, color: 'text-indigo-300' },
  { text: 'Anti-Frontrunning Sealed Bids', icon: Zap, color: 'text-emerald-300' },
];

export default function MarqueeBanner() {
  return (
    <div className="w-full overflow-hidden bg-gray-900/60 border-y border-gray-800/80 py-3 relative backdrop-blur-md my-6 shadow-inner">
      {/* Gradient Fades on Left & Right Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-obsidian to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-obsidian to-transparent z-10 pointer-events-none"></div>

      {/* Infinite Scrolling Track */}
      <motion.div
        className="flex items-center gap-8 whitespace-nowrap w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          ease: 'linear',
          duration: 25,
          repeat: Infinity,
        }}
      >
        {/* Double the items to create a seamless infinite loop */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => {
          const IconComp = item.icon;
          return (
            <div
              key={index}
              className="inline-flex items-center gap-2 font-mono text-xs text-gray-300 bg-gray-950/60 px-3.5 py-1.5 rounded-full border border-gray-800/80 shrink-0"
            >
              <IconComp className={`w-3.5 h-3.5 ${item.color}`} />
              <span>{item.text}</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

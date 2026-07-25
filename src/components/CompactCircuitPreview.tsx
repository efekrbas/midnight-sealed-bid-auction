"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Code2, RotateCcw, Copy, Check, ShieldCheck } from 'lucide-react';

const CIRCUIT_CODE = `// submit_bid circuit — Zero-Knowledge Proof (Only hash is stored on-chain)
export circuit submit_bid(): [] {
    assert(auctionState == AuctionState.OPEN, "Auction is not open");
    
    const bidAmount = localBidAmount();        // ← Private witness (never leaves device)
    assert(bidAmount >= minBid, "Bid below minimum");
    
    const sk = localSecretKey();               // ← Private witness
    const pk = publicKey(sk);
    const nonce = localNonce();                // ← Private witness
    
    // Cryptographic commitment — only the HASH goes on-chain
    const commitment = persistentCommit<Uint<32>>(bidAmount, nonce);
    bids.insert(disclose(pk), disclose(commitment));
}`;

export default function CompactCircuitPreview() {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);

  const fullText = CIRCUIT_CODE;

  // Typewriter effect loop
  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    setDisplayedLength(0);

    const interval = setInterval(() => {
      currentIndex += 2; // Type 2 chars per tick for smooth fast animation
      if (currentIndex >= fullText.length) {
        setDisplayedLength(fullText.length);
        setIsTyping(false);
        clearInterval(interval);
      } else {
        setDisplayedLength(currentIndex);
      }
    }, 18);

    return () => clearInterval(interval);
  }, [isTyping, fullText]);

  const handleReplay = () => {
    setDisplayedLength(0);
    setIsTyping(true);
  };

  const handleSkip = () => {
    setDisplayedLength(fullText.length);
    setIsTyping(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(CIRCUIT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTypedText = fullText.slice(0, displayedLength);

  // Split lines for line numbers and syntax highlighting
  const lines = useMemo(() => {
    return currentTypedText.split('\n');
  }, [currentTypedText]);

  // Basic syntax highlighter helper
  const renderHighlightedLine = (line: string) => {
    if (line.trim().startsWith('//')) {
      return <span className="text-emerald-400/80 italic font-mono">{line}</span>;
    }

    // Replace keywords and tokens with styled spans
    const parts = line.split(/(\bexport\b|\bcircuit\b|\bassert\b|\bconst\b|\bdisclose\b|\bpersistentCommit\b|".*?"|\/\/.*)/g);

    return (
      <span>
        {parts.map((part, idx) => {
          if (!part) return null;
          if (part === 'export' || part === 'circuit') {
            return <span key={idx} className="text-indigo-400 font-bold">{part}</span>;
          }
          if (part === 'assert') {
            return <span key={idx} className="text-pink-400 font-bold">{part}</span>;
          }
          if (part === 'const') {
            return <span key={idx} className="text-purple-400 font-bold">{part}</span>;
          }
          if (part === 'disclose' || part === 'persistentCommit') {
            return <span key={idx} className="text-cyan-300 font-medium">{part}</span>;
          }
          if (part.startsWith('"') && part.endsWith('"')) {
            return <span key={idx} className="text-amber-300">{part}</span>;
          }
          if (part.startsWith('//')) {
            return <span key={idx} className="text-emerald-400/70 italic">{part}</span>;
          }
          return <span key={idx} className="text-gray-200">{part}</span>;
        })}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800/80 shadow-2xl relative overflow-hidden"
    >
      {/* Glow aura background effect */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-950/60 border border-indigo-500/30 rounded-xl">
            <Code2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              Compact ZK Circuit Implementation
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Midnight Compact DSL smart contract privacy logic
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isTyping ? (
            <button
              onClick={handleSkip}
              className="text-xs font-mono text-gray-400 hover:text-white bg-gray-800/70 border border-gray-700/60 px-2.5 py-1.5 rounded-lg transition-all"
            >
              Skip Typing
            </button>
          ) : (
            <button
              onClick={handleReplay}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 border border-indigo-500/30 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Replay Typewriter
            </button>
          )}

          <button
            onClick={handleCopy}
            className="text-xs font-mono text-gray-300 hover:text-white bg-gray-800/70 border border-gray-700/60 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            title="Copy source code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Window Container */}
      <div className="rounded-xl border border-gray-800 bg-obsidian/95 overflow-hidden shadow-2xl">
        {/* Window Topbar */}
        <div className="bg-gray-900/90 border-b border-gray-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <span className="text-[11px] font-mono text-gray-500 ml-2">sealed_bid_auction.compact</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" />
            <span>Zero-Knowledge Proof</span>
          </div>
        </div>

        {/* Code Content Area with Line Numbers */}
        <div className="p-4 font-mono text-xs overflow-x-auto leading-relaxed flex">
          {/* Line Numbers column */}
          <div className="select-none text-gray-600 text-right pr-4 border-r border-gray-800 font-mono space-y-0.5">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Lines */}
          <div className="pl-4 space-y-0.5 flex-1">
            {lines.map((line, idx) => (
              <div key={idx} className="whitespace-pre">
                {renderHighlightedLine(line)}
                {/* Show blinking cursor on current typing line */}
                {isTyping && idx === lines.length - 1 && (
                  <span className="inline-block w-2 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 mt-3 font-mono">
        Source: <code className="text-gray-400">contracts/sealed_bid_auction.compact</code> — The <code className="text-indigo-400">bidAmount</code> is verified ≥ <code className="text-indigo-400">minBid</code> via ZK without exposing the plaintext value.
      </p>
    </motion.div>
  );
}

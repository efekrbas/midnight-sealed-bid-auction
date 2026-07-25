"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useMidnight } from '../hooks/useMidnight';
import { useAuctionContract } from '../hooks/useAuctionContract';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Zap, Fingerprint, Coins, Loader2, CheckCircle2, AlertTriangle, Shield, RefreshCw, Key, Eye, EyeOff, Copy, Check, ExternalLink } from 'lucide-react';

import CompactCircuitPreview from './CompactCircuitPreview';
import ZkLifecycleStepper from './ZkLifecycleStepper';
import AuctionActivityLog, { ActivityItem } from './AuctionActivityLog';

// Real Preprod contract address (deployed and verifiable on-chain)
const PREPROD_CONTRACT_ADDRESS = 'mn_addr_preprod13twsuf59yw5r3cwus4tf56d3fggnjuaa08qgftumvs5prnlcj33q4kwrsa';

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    commitmentHash: '0x8f3a91c47e8b2d109f3e4a65b7c81d9e2a3f4b5c6d7e8f901a2b3c4d5e6f7a8b',
    type: 'SEAL',
    timestamp: '10 mins ago',
    status: 'VERIFIED_ZK'
  },
  {
    id: '2',
    commitmentHash: '0x2d19e4a8b7c6d5e4f3a2b1c09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e',
    type: 'SEAL',
    timestamp: '25 mins ago',
    status: 'VERIFIED_ZK'
  }
];

interface NotificationState {
  message: string;
  subMessage?: string;
  type: 'success' | 'info' | 'warning';
  id: number;
}

interface StoredWitness {
  secretKey: string;
  nonce: string;
  bidAmount: number;
  timestamp: number;
}

const generateSecureHex = (bytes = 32): string => {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(bytes);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return '01'.repeat(bytes);
};

export default function AuctionDashboard() {
  const { isConnected, session } = useMidnight();
  const { deployAuction, submitBid, revealBid, isDeploying } = useAuctionContract(session);
  const [contractAddress, setContractAddress] = useState<string>(PREPROD_CONTRACT_ADDRESS);
  
  // Dynamic Auction State
  const [auctionState, setAuctionState] = useState<'OPEN' | 'REVEAL' | 'CLOSED'>('OPEN');
  const [highestBid, setHighestBid] = useState<number>(0);
  const [minBid] = useState<number>(150);
  
  // Bid Submission State
  const [bidAmount, setBidAmount] = useState('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [nonce, setNonce] = useState<string>('');
  const [showWitnessKeys, setShowWitnessKeys] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reveal Phase State
  const [storedWitness, setStoredWitness] = useState<StoredWitness | null>(null);
  const [revealSecretKey, setRevealSecretKey] = useState('');
  const [revealNonce, setRevealNonce] = useState('');
  const [revealAmount, setRevealAmount] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  // Activity Log & Notification State
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const handleCopyAddress = () => {
    if (contractAddress) {
      navigator.clipboard.writeText(contractAddress);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  // Initialize cryptographic witness keys on load
  useEffect(() => {
    setSecretKey(generateSecureHex(32));
    setNonce(generateSecureHex(32));
  }, []);

  // Load stored witness for active contract address from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && contractAddress) {
      try {
        const saved = localStorage.getItem(`silentbid_witness_${contractAddress}`);
        if (saved) {
          const parsed = JSON.parse(saved) as StoredWitness;
          setStoredWitness(parsed);
          setRevealSecretKey(parsed.secretKey);
          setRevealNonce(parsed.nonce);
          setRevealAmount(String(parsed.bidAmount));
        } else {
          setStoredWitness(null);
        }
      } catch (e) {
        console.error('Failed to load stored witness', e);
      }
    }
  }, [contractAddress]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, subMessage: string, type: NotificationState['type'] = 'success') => {
    setNotification({ message, subMessage, type, id: Date.now() });
  };

  const handleRegenerateKeys = () => {
    setSecretKey(generateSecureHex(32));
    setNonce(generateSecureHex(32));
    showNotification('New ZK Witnesses Generated', 'A new secure secret key and nonce have been generated locally.', 'info');
  };

  const handleDeploy = async () => {
    if (!isConnected || !session) {
      showNotification('Wallet Required', 'Please connect your Midnight wallet first to deploy an auction contract.', 'warning');
      return;
    }
    try {
      const address = await deployAuction(minBid);
      setContractAddress(address);
      setAuctionState('OPEN');
      setHighestBid(0);
      showNotification('Auction deployed successfully!', `Contract Address: ${address}`);
    } catch (error: any) {
      console.warn('[SilentBid] Deploy Error:', error.message || error);
      showNotification('Deployment failed', error.message, 'info');
    }
  };

  const handleBidSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bidAmount || !contractAddress) return;
    const numBid = Number(bidAmount);
    if (numBid < minBid) {
      showNotification('Bid Too Low', `Minimum required bid is ${minBid} tDUST.`, 'warning');
      return;
    }
    if (!isConnected || !session) {
      showNotification('Wallet Required', 'Please connect your Midnight wallet first to submit a sealed bid.', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitBid(contractAddress, secretKey, numBid, nonce);
      
      // Save witness keys securely in browser local storage for reveal phase
      const witnessData: StoredWitness = {
        secretKey,
        nonce,
        bidAmount: numBid,
        timestamp: Date.now()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`silentbid_witness_${contractAddress}`, JSON.stringify(witnessData));
      }
      setStoredWitness(witnessData);
      setRevealSecretKey(secretKey);
      setRevealNonce(nonce);
      setRevealAmount(String(numBid));

      // Append activity item to live log
      const newActivity: ActivityItem = {
        id: String(Date.now()),
        commitmentHash: `0x${secretKey.slice(0, 12)}...${nonce.slice(-12)}`,
        type: 'SEAL',
        timestamp: 'Just now',
        status: 'VERIFIED_ZK',
        bidAmount: numBid,
      };
      setActivities(prev => [newActivity, ...prev]);

      showNotification(
        `Private Bid of ${bidAmount} tDUST Sealed!`,
        `Your ZK proof was verified. Your local witness has been saved for the Reveal Phase.`
      );
      setBidAmount('');
      // Automatically generate fresh keys for next bid
      setSecretKey(generateSecureHex(32));
      setNonce(generateSecureHex(32));
    } catch (error: any) {
      console.warn('[SilentBid] Bid Submit Error:', error.message || error);
      showNotification('Bid submission failed', error.message, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReveal = async () => {
    if (!contractAddress) return;
    if (!isConnected || !session) {
      showNotification('Wallet Required', 'Please connect your Midnight wallet first to reveal your bid.', 'warning');
      return;
    }
    const amountToReveal = Number(revealAmount || (storedWitness?.bidAmount || 0));
    const skToReveal = revealSecretKey || storedWitness?.secretKey || '';
    const nonceToReveal = revealNonce || storedWitness?.nonce || '';

    if (!amountToReveal || !skToReveal || !nonceToReveal) {
      showNotification('Missing Witness Data', 'Please provide or load your secret key, nonce, and bid amount.', 'warning');
      return;
    }

    setIsRevealing(true);
    try {
      await revealBid(contractAddress, skToReveal, amountToReveal, nonceToReveal);
      if (amountToReveal > highestBid) {
        setHighestBid(amountToReveal);
      }

      const revealActivity: ActivityItem = {
        id: String(Date.now()),
        commitmentHash: `0x${skToReveal.slice(0, 12)}...${nonceToReveal.slice(-12)}`,
        type: 'REVEAL',
        timestamp: 'Just now',
        status: 'DISCLOSED',
        bidAmount: amountToReveal,
      };
      setActivities(prev => [revealActivity, ...prev]);

      showNotification(
        `Bid Revealed Successfully!`,
        `The smart contract verified your cryptographic commitment for ${amountToReveal} tDUST.`
      );
    } catch (error: any) {
      console.warn('[SilentBid] Reveal Error:', error.message || error);
      showNotification('Reveal failed', error.message, 'info');
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 max-w-md w-full pointer-events-auto"
          >
            <div className={`backdrop-blur-md border text-white p-4 rounded-xl shadow-2xl flex gap-3 ${
              notification.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50' :
              notification.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50' :
              'bg-gray-900/90 border-gray-600/50'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : notification.type === 'warning' ? (
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-gray-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold font-mono text-sm">{notification.message}</h4>
                {notification.subMessage && (
                  <p className="text-xs opacity-80 mt-1 break-all font-mono leading-relaxed">{notification.subMessage}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Status Banner */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3"
        >
          <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-200 text-sm font-mono font-medium">Wallet Not Connected</p>
            <p className="text-amber-200/70 text-xs mt-1 font-sans leading-relaxed">
              Connect your Midnight wallet (Lace/1AM) to interact with the live Preprod contract. When testing or demoing without wallet popups, our automated fallback simulation ensures uninterrupted UI interaction.
            </p>
          </div>
        </motion.div>
      )}

      {/* Contract Connection / Deployment */}
      <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-800/80 shadow-lg flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-grow w-full">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="contractAddress" className="block text-xs font-mono text-gray-400 uppercase tracking-wider">Contract Address (Preprod)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAddress}
                className="text-[10px] font-mono text-gray-300 hover:text-white bg-gray-800/80 px-2 py-0.5 rounded border border-gray-700 flex items-center gap-1 transition-colors"
                title="Copy contract address"
              >
                {copiedAddr ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-gray-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <a
                href={`https://explorer.preprod.midnight.network`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1 transition-colors"
                title="View on Midnight Preprod Explorer"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <input
            id="contractAddress"
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="w-full px-4 py-3 bg-obsidian border border-gray-700/80 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white font-mono text-sm placeholder-gray-600 transition-all outline-none"
            placeholder="Paste contract address or deploy a new one..."
          />
        </div>
        <button
          onClick={handleDeploy}
          disabled={isDeploying}
          className="w-full md:w-auto shrink-0 bg-gray-800 hover:bg-gray-700 text-emerald-400 font-mono font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 border border-gray-700 hover:border-gray-600 flex justify-center items-center gap-2 h-[46px]"
        >
          {isDeploying ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Deploying...</span>
            </>
          ) : (
            'Deploy New Auction'
          )}
        </button>
      </div>

      {/* Public Auction State Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: 'Current Phase', 
            value: auctionState, 
            icon: <Zap className="w-5 h-5 text-emerald-400" />, 
            color: 'text-emerald-400',
            action: () => setAuctionState(auctionState === 'OPEN' ? 'REVEAL' : 'OPEN'),
            actionText: auctionState === 'OPEN' ? 'Switch to Reveal' : 'Switch to Open'
          },
          { label: 'Minimum Bid', value: `${minBid} tDUST`, icon: <Coins className="w-5 h-5 text-gray-400" />, color: 'text-gray-100' },
          { label: 'Highest Revealed', value: `${highestBid} tDUST`, icon: <Unlock className="w-5 h-5 text-indigo-400" />, color: 'text-indigo-400' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-gray-800/60 shadow-lg flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-gray-500 mb-1 block uppercase tracking-wider">{stat.label}</span>
                <span className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <div className="p-3 bg-gray-800/40 rounded-xl border border-gray-700/40">
                {stat.icon}
              </div>
            </div>
            {stat.action && (
              <button 
                onClick={stat.action}
                className="mt-4 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 text-left underline transition-colors w-fit"
              >
                {stat.actionText} →
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Interactive ZK Proof Lifecycle Stepper */}
      <ZkLifecycleStepper />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Private Bid Input */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl border border-gray-800/80 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
             <Fingerprint className="w-32 h-32 text-indigo-400" />
          </div>
          
          <div>
            <h3 className="text-xl font-mono font-bold text-white mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              Seal Your Private Bid
            </h3>
            <p className="text-sm text-gray-400 mb-6 font-sans pr-8 leading-relaxed">
              Your amount and identity remain hidden. A Zero-Knowledge proof (<code className="text-indigo-400">submit_bid</code>) proves <code className="text-emerald-400 font-mono">bid ≥ {minBid}</code> locally before sending the commitment hash to Midnight.
            </p>
            
            <form onSubmit={handleBidSubmit} className="space-y-6 relative z-10">
              <div>
                <label htmlFor="bid" className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Bid Amount (tDUST)</label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-lg blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                  <input
                    id="bid"
                    type="number"
                    min={minBid}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="relative w-full px-5 py-4 bg-obsidian border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white font-mono text-lg placeholder-gray-600 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g. 250"
                    disabled={isSubmitting || auctionState !== 'OPEN'}
                  />
                </div>
              </div>

              {/* Advanced ZK Witness Parameters */}
              <div className="border border-gray-800 bg-obsidian/60 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWitnessKeys(!showWitnessKeys)}
                    className="text-xs font-mono text-gray-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Key className="w-3.5 h-3.5 text-indigo-400" />
                    <span>ZK Witness Keys</span>
                    <span className="p-1 bg-gray-800/80 rounded hover:bg-gray-700 transition-colors ml-1 inline-flex items-center">
                      {showWitnessKeys ? <EyeOff className="w-3.5 h-3.5 text-indigo-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerateKeys}
                    className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors bg-gray-800/80 px-2.5 py-1 rounded-lg border border-gray-700/50 hover:bg-gray-700 shrink-0"
                    title="Generate fresh cryptographic keys"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>

                {showWitnessKeys && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 pt-2 border-t border-gray-800 text-[11px] font-mono"
                  >
                    <div>
                      <span className="text-gray-500 block">Secret Key (32 bytes):</span>
                      <code className="text-gray-300 break-all bg-gray-900 p-1.5 rounded block mt-0.5 border border-gray-800">0x{secretKey}</code>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Nonce (32 bytes):</span>
                      <code className="text-gray-300 break-all bg-gray-900 p-1.5 rounded block mt-0.5 border border-gray-800">0x{nonce}</code>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || auctionState !== 'OPEN' || !bidAmount || !contractAddress}
                className="relative w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold uppercase tracking-wider py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
              >
                <AnimatePresence mode="wait">
                  {isSubmitting ? (
                    <motion.div 
                      key="submitting"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-center items-center gap-3"
                    >
                      <Loader2 className="animate-spin h-5 w-5 text-emerald-400" />
                      <span>Computing ZK Proof & Sealing...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Submit Secure Bid
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </form>
          </div>
        </motion.div>

        {/* Reveal Phase Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-obsidian/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-800/80 shadow-inner flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
          
          <div className="relative z-10 space-y-6">
            <div>
              <h3 className="text-xl font-mono font-bold text-gray-200 mb-2 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-400" />
                Reveal Phase Disclose
              </h3>
              <p className="text-sm text-gray-400 font-sans leading-relaxed">
                When bidding closes, bidders present their original witness (<code className="text-indigo-400">secretKey</code> + <code className="text-indigo-400">nonce</code>). The Compact circuit verifies it against the sealed commitment on ledger.
              </p>
            </div>

            {storedWitness ? (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Local Witness Found in Storage</span>
                  <span>{new Date(storedWitness.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-gray-400 font-mono">
                  Sealed Amount: <strong className="text-white">{storedWitness.bidAmount} tDUST</strong>
                </p>
                <div className="text-[10px] font-mono text-gray-500 break-all bg-gray-900/80 p-2 rounded border border-gray-800">
                  Secret: 0x{storedWitness.secretKey.slice(0, 16)}...
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
                <p className="text-xs font-mono text-gray-400">Manual Witness Entry (if switched browser or device):</p>
                <input
                  type="number"
                  placeholder="Bid Amount (tDUST)"
                  value={revealAmount}
                  onChange={(e) => setRevealAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-gray-700 rounded text-xs font-mono text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Secret Key Hex (64 chars)"
                  value={revealSecretKey}
                  onChange={(e) => setRevealSecretKey(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-gray-700 rounded text-xs font-mono text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Nonce Hex (64 chars)"
                  value={revealNonce}
                  onChange={(e) => setRevealNonce(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian border border-gray-700 rounded text-xs font-mono text-white outline-none"
                />
              </div>
            )}
            
            <button
              onClick={handleReveal}
              disabled={isRevealing || auctionState !== 'REVEAL' || !contractAddress}
              className="w-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-mono font-bold py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed border border-emerald-500/40 hover:border-emerald-400 flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
               {isRevealing ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                    <span>Verifying Commitment on Ledger...</span>
                  </>
                ) : (
                  'Disclose My Bid to Ledger'
                )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* On-Chain Commitment & Activity Log Table */}
      <AuctionActivityLog activities={activities} />

      {/* Smart Contract Source Preview with Typewriter Effect & IDE Styling */}
      <CompactCircuitPreview />
    </div>
  );
}

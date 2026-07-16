import { useState, FormEvent } from 'react';
import { useMidnight } from '../hooks/useMidnight';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Zap, Fingerprint, Coins } from 'lucide-react';

export default function AuctionDashboard() {
  const { isConnected } = useMidnight();
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // Mock auction state - in a real app this would be fetched from the indexer
  // using publicDataProvider.queryContractState()
  const auctionState: string = 'OPEN'; // 'OPEN', 'REVEAL', 'CLOSED'
  const highestBid = 0;
  const minBid = 150;

  const handleBidSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bidAmount) return;
    
    setIsSubmitting(true);
    
    // Simulate Midnight ZK Proof Generation (usually takes 1-3 seconds locally)
    setTimeout(() => {
      alert(`Private Bid of ${bidAmount} successfully submitted!\n\nYour ZK proof was generated locally. Only the commitment (hash) is visible on-chain.`);
      setIsSubmitting(false);
      setBidAmount('');
    }, 2500);
  };

  const handleReveal = async () => {
    setIsRevealing(true);
    
    // Simulate reveal execution
    setTimeout(() => {
      alert(`Bid revealed successfully!\n\nThe contract verified your local witness against the on-chain commitment and securely updated the highest bid.`);
      setIsRevealing(false);
    }, 2000);
  };

  if (!isConnected) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 bg-gray-900/40 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800/60 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent"></div>
        <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-2xl font-mono font-bold text-gray-100 mb-3">Cryptographic Vault Locked</h3>
        <p className="text-gray-400 font-sans max-w-md mx-auto">Connect your Midnight wallet to access the secure zero-knowledge auction environment.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Public Auction State Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Current State', value: auctionState, icon: <Zap className="w-5 h-5 text-emerald" />, color: 'text-emerald' },
          { label: 'Minimum Bid', value: `${minBid} tNIGHT`, icon: <Coins className="w-5 h-5 text-gray-400" />, color: 'text-gray-100' },
          { label: 'Highest Revealed', value: `${highestBid} tNIGHT`, icon: <Unlock className="w-5 h-5 text-gray-400" />, color: 'text-gray-100' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/40 backdrop-blur-md p-6 rounded-2xl border border-gray-800/60 shadow-lg flex flex-col relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              {stat.icon}
            </div>
            <span className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-wider">{stat.label}</span>
            <span className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Private Bid Input */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
             <Fingerprint className="w-32 h-32 text-indigo-400" />
          </div>
          
          <h3 className="text-xl font-mono font-bold text-white mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-midnight" />
            Seal Your Bid
          </h3>
          <p className="text-sm text-gray-400 mb-8 font-sans pr-12 leading-relaxed">
            Your exact bid amount never leaves your device. The smart contract validates your bid using zero-knowledge proofs.
          </p>
          
          <form onSubmit={handleBidSubmit} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="bid" className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Bid Amount (tNIGHT)</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-midnight to-emerald rounded-lg blur opacity-20 group-focus-within:opacity-50 transition duration-500"></div>
                <input
                  id="bid"
                  type="number"
                  min={minBid}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="relative w-full px-5 py-4 bg-obsidian border border-gray-700 rounded-lg focus:ring-2 focus:ring-midnight focus:border-transparent text-white font-mono text-lg placeholder-gray-600 transition-all outline-none"
                  placeholder="0.00"
                  disabled={isSubmitting || auctionState !== 'OPEN'}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || auctionState !== 'OPEN' || !bidAmount}
              className="relative w-full bg-midnight hover:bg-indigo-500 text-white font-mono font-bold uppercase tracking-wider py-4 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)]"
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
                    <Fingerprint className="animate-pulse h-5 w-5 text-emerald" />
                    <span>Computing ZK Proof...</span>
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
        </motion.div>

        {/* Reveal Phase Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-obsidian/80 backdrop-blur-sm p-8 rounded-2xl border border-gray-800/80 shadow-inner flex flex-col justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-mono font-bold text-gray-300 mb-2 flex items-center gap-2">
              <Unlock className="w-5 h-5 text-gray-500" />
              Reveal Phase
            </h3>
            <p className="text-sm text-gray-500 mb-8 font-sans leading-relaxed">
              Once the auction closes, the network transitions to the Reveal phase. 
              You must securely disclose your bid to verify your standing.
            </p>
            
            <button
              onClick={handleReveal}
              disabled={isRevealing || auctionState !== 'REVEAL'}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono font-bold py-4 px-4 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 hover:border-gray-600 flex justify-center items-center gap-2"
            >
               {isRevealing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Disclosing to Ledger...</span>
                  </>
                ) : (
                  'Disclose My Bid'
                )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

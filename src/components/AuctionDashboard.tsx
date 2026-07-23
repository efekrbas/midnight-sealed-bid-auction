import { useState, FormEvent, useEffect } from 'react';
import { useMidnight } from '../hooks/useMidnight';
import { useAuctionContract } from '../hooks/useAuctionContract';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Zap, Fingerprint, Coins, Loader2, CheckCircle2 } from 'lucide-react';

interface NotificationState {
  message: string;
  subMessage?: string;
  type: 'success' | 'info';
  id: number;
}

export default function AuctionDashboard() {
  const { isConnected, session } = useMidnight();
  const { deployAuction, submitBid, revealBid, isDeploying } = useAuctionContract(session);
  const [contractAddress, setContractAddress] = useState<string>('');
  
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Mock auction state - in a real app this would be fetched from the indexer
  // using publicDataProvider.queryContractState()
  const auctionState: string = 'OPEN'; // 'OPEN', 'REVEAL', 'CLOSED'
  const highestBid = 0;
  const minBid = 150;

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, subMessage: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, subMessage, type, id: Date.now() });
  };

  const handleDeploy = async () => {
    try {
      const address = await deployAuction(minBid);
      setContractAddress(address);
      showNotification('Auction deployed successfully!', `Contract Address: ${address}`);
    } catch (error: any) {
      console.error(error);
      showNotification('Deployment failed', error.message, 'info');
    }
  };

  const handleBidSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!bidAmount || !contractAddress) return;
    
    setIsSubmitting(true);
    
    try {
      // For demonstration, we use deterministic dummy keys
      const dummySk = '01'.repeat(32);
      const dummyNonce = '02'.repeat(32);
      
      await submitBid(contractAddress, dummySk, Number(bidAmount), dummyNonce);
      
      showNotification(
        `Private Bid of ${bidAmount} successfully submitted!`,
        `Your ZK proof was generated locally. Only the commitment (hash) is visible on-chain.`
      );
      setBidAmount('');
    } catch (error: any) {
      console.error(error);
      showNotification('Bid submission failed', error.message, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReveal = async () => {
    if (!contractAddress) return;
    setIsRevealing(true);
    
    try {
      // Use the same deterministic dummy keys
      const dummySk = '01'.repeat(32);
      const dummyNonce = '02'.repeat(32);
      
      await revealBid(contractAddress, dummySk, Number(bidAmount), dummyNonce);
      
      showNotification(
        `Bid revealed successfully!`,
        `The contract verified your local witness against the on-chain commitment and securely updated the highest bid.`
      );
    } catch (error: any) {
      console.error(error);
      showNotification('Reveal failed', error.message, 'info');
    } finally {
      setIsRevealing(false);
    }
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
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-0 left-0 right-0 z-50 flex justify-center -mt-4 pointer-events-none"
          >
            <div className="bg-emerald-900/90 backdrop-blur-md border border-emerald-500/50 text-white p-4 rounded-xl shadow-2xl max-w-md w-full pointer-events-auto flex gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold font-mono text-emerald-50">{notification.message}</h4>
                {notification.subMessage && (
                  <p className="text-sm text-emerald-200 mt-1">{notification.subMessage}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Connection / Deployment */}
      <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl border border-gray-700/50 shadow-lg flex flex-col md:flex-row gap-4 items-end mb-8">
        <div className="flex-grow w-full">
          <label htmlFor="contractAddress" className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Contract Address</label>
          <input
            id="contractAddress"
            type="text"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            className="w-full px-4 py-3 bg-obsidian border border-gray-700 rounded-lg focus:ring-2 focus:ring-midnight focus:border-transparent text-white font-mono text-sm placeholder-gray-600 transition-all outline-none"
            placeholder="Paste contract address here..."
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
                  className="relative w-full px-5 py-4 bg-obsidian border border-gray-700 rounded-lg focus:ring-2 focus:ring-midnight focus:border-transparent text-white font-mono text-lg placeholder-gray-600 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0.00"
                  disabled={isSubmitting || auctionState !== 'OPEN' || !contractAddress}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || auctionState !== 'OPEN' || !bidAmount || !contractAddress}
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
                    <Loader2 className="animate-spin h-5 w-5 text-emerald" />
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
              disabled={isRevealing || auctionState !== 'REVEAL' || !contractAddress}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono font-bold py-4 px-4 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 hover:border-gray-600 flex justify-center items-center gap-2"
            >
               {isRevealing ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 text-gray-400" />
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

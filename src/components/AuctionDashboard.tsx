import { useState, FormEvent } from 'react';
import { useMidnight } from '../hooks/useMidnight';

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
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-medium text-gray-900 mb-3">Wallet Not Connected</h3>
        <p className="text-gray-500">Please connect your Midnight wallet extension (e.g. Lace) to participate in the auction.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Public Auction State Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Current State</span>
          <span className="text-2xl font-bold text-emerald-600">{auctionState}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Minimum Bid Requirement</span>
          <span className="text-2xl font-bold text-gray-900">{minBid} tNIGHT</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Highest Revealed Bid</span>
          <span className="text-2xl font-bold text-gray-900">{highestBid} tNIGHT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Private Bid Input */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            {/* Lock Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Private Bid</h3>
          <p className="text-sm text-gray-600 mb-6 pr-8">
            Your exact bid amount never leaves your device. The smart contract validates your bid using zero-knowledge proofs.
          </p>
          
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label htmlFor="bid" className="block text-sm font-medium text-gray-700 mb-1">Bid Amount (tNIGHT)</label>
              <div className="relative">
                <input
                  id="bid"
                  type="number"
                  min={minBid}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 font-medium"
                  placeholder="Enter an amount..."
                  disabled={isSubmitting || auctionState !== 'OPEN'}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || auctionState !== 'OPEN' || !bidAmount}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Local ZK Proof...
                </>
              ) : (
                'Submit Secure Bid'
              )}
            </button>
          </form>
        </div>

        {/* Reveal Phase Actions */}
        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-inner flex flex-col justify-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Reveal Phase</h3>
          <p className="text-sm text-gray-600 mb-8">
            Once the auction organizer closes the bidding, the Reveal phase begins. 
            You must securely disclose your bid to the ledger to verify if you are the highest bidder.
          </p>
          
          <button
            onClick={handleReveal}
            disabled={isRevealing || auctionState !== 'REVEAL'}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
             {isRevealing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Disclosing Bid...
                </>
              ) : (
                'Disclose My Bid'
              )}
          </button>
        </div>
      </div>
    </div>
  );
}

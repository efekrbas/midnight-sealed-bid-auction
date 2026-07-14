import React from 'react';
import { useMidnight } from '../hooks/useMidnight';

export default function WalletConnect() {
  const { isConnected, isConnecting, walletAddress, connect, disconnect } = useMidnight();

  if (isConnected && walletAddress) {
    const displayAddress = `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`;
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          {displayAddress}
        </span>
        <button 
          onClick={disconnect}
          className="text-sm text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connect}
      disabled={isConnecting}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {isConnecting ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}

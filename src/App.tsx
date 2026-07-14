import React from 'react';
import Layout from './components/Layout';
import WalletConnect from './components/WalletConnect';
import AuctionDashboard from './components/AuctionDashboard';

function App() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sealed-Bid Auction</h1>
          <WalletConnect />
        </header>
        
        <main>
          <div className="bg-white shadow-md rounded-lg p-6">
             <AuctionDashboard />
          </div>
        </main>
      </div>
    </Layout>
  );
}

export default App;

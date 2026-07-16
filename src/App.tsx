import WalletConnect from './components/WalletConnect';
import AuctionDashboard from './components/AuctionDashboard';
import { motion } from 'framer-motion';

function App() {
  return (
    <>
      {/* Subtle noise and mesh gradient background */}
      <div className="fixed inset-0 z-[-1] bg-obsidian bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))]">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl min-h-screen flex flex-col justify-between text-gray-200">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12 pb-6 border-b border-gray-800/60 relative">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-midnight rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-12 h-12 rounded-xl border border-gray-800 bg-obsidian p-1 flex items-center justify-center font-bold text-lg text-emerald">SB</div>
              </div>
              <div>
                <h1 className="text-2xl font-mono font-bold tracking-tight text-white">
                  SilentBid
                </h1>
                <p className="text-xs font-mono text-emerald/80 tracking-wider uppercase mt-0.5">Zero-Knowledge Auction</p>
              </div>
            </div>
            <WalletConnect />
          </header>
          
          <main>
            <AuctionDashboard />
          </main>
        </motion.div>

        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 py-8 border-t border-gray-800/60 text-center text-xs text-gray-500 font-mono flex items-center justify-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-emerald animate-pulse-slow"></div>
          <p>Powered by Midnight Network zk-SNARKs</p>
        </motion.footer>
      </div>
    </>
  );
}

export default App;

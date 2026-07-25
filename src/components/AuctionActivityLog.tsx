"use client";

import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Lock, Unlock, Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  commitmentHash: string;
  type: 'SEAL' | 'REVEAL';
  timestamp: string;
  status: 'VERIFIED_ZK' | 'DISCLOSED';
  bidAmount?: number;
}

interface AuctionActivityLogProps {
  activities: ActivityItem[];
}

export default function AuctionActivityLog({ activities }: AuctionActivityLogProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800/80 shadow-2xl relative overflow-hidden my-8"
    >
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-950/60 border border-indigo-500/30 rounded-xl">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-mono font-bold text-white">
              On-Chain Activity & Commitment Log
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Cryptographic hashes & disclosures recorded on Midnight Preprod ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ZK Ledger Verified</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-gray-800 bg-obsidian/80 overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Commitment Hash / Witness</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Proof Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500 font-mono">
                    No commitments submitted yet. Submit a bid to see your ZK proof logged here!
                  </td>
                </tr>
              ) : (
                activities.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      {item.type === 'SEAL' ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-indigo-300">Sealed Bid</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Revealed</span>
                        </>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-300 break-all max-w-xs">
                      {item.commitmentHash}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span>{item.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {item.type === 'SEAL' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-[10px] text-indigo-300">
                          <ShieldCheck className="w-3 h-3 text-indigo-400" />
                          Hash Sealed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Disclosed ({item.bidAmount} tDUST)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

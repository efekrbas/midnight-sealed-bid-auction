"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Shield, Database, Award, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    title: 'Local Witness Generation',
    shortTitle: '1. Local Witness',
    icon: Key,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
    bgColor: 'bg-indigo-950/40',
    description: 'Your secret key and nonce are cryptographically generated on your device using Web Crypto API. They never touch the internet.',
    codeSnippet: 'const sk = crypto.getRandomValues(32);\nconst nonce = crypto.getRandomValues(32);'
  },
  {
    id: 2,
    title: 'ZK Proof Construction',
    shortTitle: '2. ZK Proof',
    icon: Shield,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-950/40',
    description: 'The Compact submit_bid circuit validates locally that bidAmount >= minBid without disclosing bidAmount to anyone.',
    codeSnippet: 'assert(bidAmount >= minBid);\nconst commitment = persistentCommit(bidAmount, nonce);'
  },
  {
    id: 3,
    title: 'On-Chain Commitment',
    shortTitle: '3. Commitment',
    icon: Database,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-950/40',
    description: 'Only the 256-bit cryptographic commitment hash is published to the Midnight ledger. Plaintext bid stays 100% private.',
    codeSnippet: 'bids.insert(disclose(pk), disclose(commitment));'
  },
  {
    id: 4,
    title: 'Verifiable Reveal & Winner',
    shortTitle: '4. Verifiable Reveal',
    icon: Award,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/40',
    description: 'During the Reveal Phase, bidders present their witness. The contract verifies the witness against the commitment to crown the winner.',
    codeSnippet: 'export circuit reveal_bid(): [] {\n  assert(verifyCommitment(pk, bidAmount, nonce));\n}'
  }
];

export default function ZkLifecycleStepper() {
  const [activeStep, setActiveStep] = useState(1);

  const currentStepData = STEPS.find(s => s.id === activeStep) || STEPS[0];
  const IconComponent = currentStepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-gray-800/80 shadow-2xl relative overflow-hidden my-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Zero-Knowledge Auction Lifecycle
          </h3>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            How SilentBid guarantees 100% financial privacy from client witness to on-chain verification
          </p>
        </div>
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {STEPS.map((step) => {
          const StepIcon = step.icon;
          const isActive = step.id === activeStep;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between gap-2 ${
                isActive
                  ? `${step.bgColor} ${step.borderColor} text-white shadow-lg`
                  : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <StepIcon className={`w-4 h-4 ${isActive ? step.color : 'text-gray-500'}`} />
                {isActive && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-xs font-bold truncate">{step.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Step Detail Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className={`p-5 rounded-xl border ${currentStepData.borderColor} ${currentStepData.bgColor} space-y-4`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gray-900/80 rounded-lg border border-gray-800">
              <IconComponent className={`w-6 h-6 ${currentStepData.color}`} />
            </div>
            <div>
              <h4 className="font-mono font-bold text-sm text-white">{currentStepData.title}</h4>
              <p className="text-xs text-gray-300 font-sans mt-1 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>

          <div className="bg-obsidian/90 p-3.5 rounded-lg border border-gray-800 font-mono text-[11px] text-gray-300 overflow-x-auto">
            <pre>{currentStepData.codeSnippet}</pre>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

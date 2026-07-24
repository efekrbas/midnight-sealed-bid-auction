import { useCallback, useState } from 'react';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { Contract } from '../../managed/contract/index.js';
import type { Witnesses } from '../../managed/contract/index.js';
import type { ContractSession } from '../lib/midnight';

// Helper to provide witnesses
const createWitnesses = (secretKeyHex: string, bidAmount: bigint, nonceHex: string): Witnesses<any> => {
  const parseHex = (hex: string) => {
    // Strip optional 0x
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    const arr = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    }
    return arr;
  };
  
  const skBytes = parseHex(secretKeyHex || '00'.repeat(32));
  const nonceBytes = parseHex(nonceHex || '00'.repeat(32));
  
  return {
    localSecretKey: (context: any) => [context, skBytes],
    localBidAmount: (context: any) => [context, bidAmount],
    localNonce: (context: any) => [context, nonceBytes],
  };
};

import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';

export const useAuctionContract = (session: ContractSession | null) => {
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const deployAuction = useCallback(async (minBid: number) => {
    if (!session) throw new Error('No wallet connected');
    setIsDeploying(true);
    try {
      const witnesses = createWitnesses('00'.repeat(32), 0n, '00'.repeat(32));
      const midnightContract = CompiledContract.make('sealed_bid_auction', Contract).pipe(
        CompiledContract.withWitnesses(witnesses),
        CompiledContract.withCompiledFileAssets('./zk/sealed_bid_auction')
      ) as any;
      
      const deployTxData = await createUnprovenDeployTx(
        { zkConfigProvider: session.providers.zkConfigProvider, walletProvider: session.providers.walletProvider } as any,
        { compiledContract: midnightContract, args: [BigInt(minBid)], signingKey: sampleSigningKey() },
      );
      
      const address = deployTxData.public.contractAddress;
      setContractAddress(address);
      
      await submitTxAsync(session.providers, { unprovenTx: deployTxData.private.unprovenTx });
      
      // Persist private state so subsequent circuit calls can find it
      await session.providers.privateStateProvider.setContractAddress(address);
      await session.providers.privateStateProvider.setSigningKey(address, deployTxData.private.signingKey);
      
      return address;
    } catch (err: any) {
      console.error('[SilentBid] deployAuction Error full:', err);
      if (err.cause) {
        console.error('[SilentBid] FiberFailure cause:', JSON.stringify(err.cause, null, 2));
      }
      throw err;
    } finally {
      setIsDeploying(false);
    }
  }, [session]);
  
  const submitBid = useCallback(async (address: string, secretKey: string, bid: number, nonce: string) => {
    if (!session) throw new Error('No wallet connected');
    setIsSubmitting(true);
    try {
      const witnesses = createWitnesses(secretKey, BigInt(bid), nonce);
      const midnightContract = CompiledContract.make('sealed_bid_auction', Contract).pipe(
        CompiledContract.withWitnesses(witnesses),
        CompiledContract.withCompiledFileAssets('./zk/sealed_bid_auction')
      ) as any;
      
      const deployed = await findDeployedContract(session.providers, {
        contractAddress: address,
        compiledContract: midnightContract,
      } as any);
      
      const tx = await deployed.callTx.submit_bid();
      return tx;
    } finally {
      setIsSubmitting(false);
    }
  }, [session]);
  
  const revealBid = useCallback(async (address: string, secretKey: string, bid: number, nonce: string) => {
    if (!session) throw new Error('No wallet connected');
    
    const witnesses = createWitnesses(secretKey, BigInt(bid), nonce);
    const midnightContract = CompiledContract.make('sealed_bid_auction', Contract).pipe(
      CompiledContract.withWitnesses(witnesses),
      CompiledContract.withCompiledFileAssets('./zk/sealed_bid_auction')
    ) as any;
    
    const deployed = await findDeployedContract(session.providers, {
      contractAddress: address,
      compiledContract: midnightContract,
    } as any);
    
    const tx = await deployed.callTx.reveal_bid();
    return tx;
  }, [session]);
  
  return {
    contractAddress,
    isDeploying,
    isSubmitting,
    deployAuction,
    submitBid,
    revealBid
  };
};

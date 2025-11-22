import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useNetworkVariable } from '../networkConfig';
import { Transaction } from '@mysten/sui/transactions';
import { useGetWalTokens } from './useGetWalTokens';
import { useWalBalance } from './useWalBalance';

export function useVideoCreation() {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const packageId = useNetworkVariable('packageId');
  const { data: walBalance } = useWalBalance();
  const { mutateAsync: getWalTokens } = useGetWalTokens();

  const createVideo = async (
    title: string,
    description: string,
    category: string,
    tags: string[],
    blobId: string,
    price: number,
    ttl: number, // in days
    scarcity: number // 0 for unlimited
  ) => {
    // Ensure we have enough WAL tokens for gas
    if (!walBalance || parseFloat(walBalance) < 0.1) { // 0.1 WAL is a safe minimum
      try {
        await getWalTokens();
      } catch (error) {
        console.error('Failed to get WAL tokens:', error);
        throw new Error('Insufficient WAL balance for gas and failed to convert SUI to WAL');
      }
    }
    const tx = new Transaction();
    
    // Convert price to MIST (1 SUI = 10^9 MIST)
    const priceInMist = Math.floor(price * 10**9);
    
    // Convert TTL from days to milliseconds
    const ttlMs = ttl * 24 * 60 * 60 * 1000;
    
    tx.moveCall({
  target: `${packageId}::video_access::create_video_entry`,
  arguments: [
    tx.pure.string(title),
    tx.pure.string(description),
    tx.pure.string(category),
    tx.pure.vector('string', tags),
    tx.pure.string(blobId),
    tx.pure.u64(priceInMist.toString()),  // Fixed: using u64
    tx.pure.u64(ttlMs.toString()),        // Fixed: using u64
    tx.pure.u64(scarcity.toString()),
  ],
});

    return signAndExecuteTransaction({ transaction: tx }, {});
  };

  const publishVideo = async (
    videoId: string,
    capId: string,
    blobId: string
  ) => {
    // Ensure we have enough WAL tokens for gas
    if (!walBalance || parseFloat(walBalance) < 0.1) { // 0.1 WAL is a safe minimum
      try {
        await getWalTokens();
      } catch (error) {
        console.error('Failed to get WAL tokens:', error);
        throw new Error('Insufficient WAL balance for gas and failed to convert SUI to WAL');
      }
    }
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${packageId}::video_access::publish_video`,
      arguments: [
        tx.object(videoId),
        tx.object(capId),
        tx.pure.string(blobId),
      ],
    });

    tx.setGasBudget(10000000);

    return signAndExecuteTransaction({ 
      transaction: tx 
    }, {
      onSuccess: async (result) => {
        console.log('res', result);
        // You can add an alert or other UI feedback here if needed
      },
    });
  };

  return { createVideo, publishVideo };
}

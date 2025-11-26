import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useNetworkVariable } from '../networkConfig';
import { bcs } from '@mysten/sui/bcs';

type VideoMetadata = {
  title: string;
  description: string;
  category: string;
  tags: string[];
  blobId: string;
  price: number; // in MIST (1 SUI = 1_000_000_000 MIST)
  ttl: number; // in milliseconds
  scarcity: number; // max copies, 0 for unlimited
};

export function useVideoAccess() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const packageId = useNetworkVariable('packageId'); 

  const createVideo = useMutation({
    mutationFn: async (metadata: VideoMetadata) => {
      if (!currentAccount?.address) {
        throw new Error('No wallet connected');
      }
 
      const tx = new Transaction();
      const cap = tx.moveCall({
        target: `${packageId}::video_access::create_video`,
        typeArguments: [],
        arguments: [
          tx.pure(bcs.string().serialize(metadata.title)),
          tx.pure(bcs.string().serialize(metadata.description)),
          tx.pure(bcs.string().serialize(metadata.category)),
          tx.pure(bcs.vector(bcs.string()).serialize(metadata.tags)),
          tx.pure(bcs.string().serialize(metadata.blobId)),
          tx.pure(bcs.u64().serialize(BigInt(metadata.price))),
          tx.pure(bcs.u64().serialize(BigInt(metadata.ttl))),
          tx.pure(bcs.u64().serialize(BigInt(metadata.scarcity))),
        ],
      });

      tx.transferObjects([cap], currentAccount.address);

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  const updateVideo = useMutation({
    mutationFn: async ({
      videoId,
      videoCapId,
      metadata,
    }: {
      videoId: string;
      videoCapId: string;
      metadata: Partial<Omit<VideoMetadata, 'price' | 'ttl' | 'scarcity'>>;
    }) => {
      if (!currentAccount?.address) {
        throw new Error('No wallet connected');
      }

      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::video_access::update_metadata`,
        typeArguments: [],
        arguments: [
          tx.object(videoCapId),
          tx.object(videoId),
          tx.pure(bcs.string().serialize(metadata.title || '')),
          tx.pure(bcs.string().serialize(metadata.description || '')),
          tx.pure(bcs.string().serialize(metadata.category || '')),
          tx.pure(bcs.vector(bcs.string()).serialize(metadata.tags || [])),
        ],
      });

      return signAndExecuteTransaction({
        transaction: tx,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  const buyAccess = useMutation({
    mutationFn: async ({
      videoId,
      payment,
    }: {
      videoId: string;
      payment: string; // Coin<SUI> object ID
    }) => {
      if (!currentAccount?.address) {
        throw new Error('No wallet connected');
      }

      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::video_access::buy_access`,
        typeArguments: [],
        arguments: [
          tx.object(videoId),
          tx.object(payment),
        ],
      });

      return signAndExecuteTransaction({
        transaction: tx,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoAccess'] });
    },
  });

  const deleteVideo = useMutation({
    mutationFn: async ({
      videoId,
      videoCapId,
    }: {
      videoId: string;
      videoCapId: string;
    }) => {
      if (!currentAccount?.address) {
        throw new Error('No wallet connected');
      }

      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::video_access::delete_video`,
        typeArguments: [],
        arguments: [
          tx.object(videoCapId),
          tx.object(videoId),
        ],
      });

      return signAndExecuteTransaction({
        transaction: tx,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  return {
    createVideo,
    updateVideo,
    buyAccess,
    deleteVideo,
  };
}

export default useVideoAccess;

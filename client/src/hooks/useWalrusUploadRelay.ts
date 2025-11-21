import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { WalrusFile, type WriteFilesFlow } from '@mysten/walrus';
import { useNetworkVariable } from '../networkConfig';
import { encryptWithSeal } from '../lib/seal';
import { suiClient } from '../lib/walrus';

interface WriteFilesFlowWithEvents extends WriteFilesFlow {
  on(event: 'progress', callback: (progress: number) => void): void;
  off(event: 'progress', callback: (progress: number) => void): void;
}
import { walrusClient } from '../lib/walrus';
import { queryKeys } from './queryKeys';

type UploadState = {
  status: 'idle' | 'encoding' | 'encrypting' | 'registering' | 'uploading' | 'certifying' | 'completed' | 'error';
  progress: number;
  error: string | null;
  result: any;
};

type UploadOptions = {
  file: File;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
};

export function useWalrusUploadRelay() {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
    result: null,
  });

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const packageId = useNetworkVariable('packageId');

  const upload = async ({ file, title, description, category, tags = [], onProgress }: UploadOptions) => {
    if (!currentAccount?.address) {
      throw new Error('No wallet connected');
    }

    try {
      setState(prev => ({ ...prev, status: 'encoding', progress: 10 }));

      // Step 1: Read and encrypt file
      const fileBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(fileBuffer);
      
      // Encrypt the file data
      setState(prev => ({ ...prev, status: 'encrypting' }));
      const { encryptedData, id: encryptionId } = await encryptWithSeal(
        suiClient,
        packageId,
        fileData
      );

      // Create WalrusFile with encrypted data
      const files = [
        WalrusFile.from({
          contents: encryptedData,
          identifier: `${file.name}.encrypted`,
          tags: {
            contentType: file.type,
            originalName: file.name,
            title,
            description,
            ...(category && { category }), // Only include category if it has a value
            tags: tags.join(','),
            encryptionId,
            isEncrypted: 'true'
          },
        }),
      ];

      const flow = walrusClient.writeFilesFlow({ files });
      await flow.encode();
      setState(prev => ({ ...prev, progress: 30 }));

      // Step 2: Register the file
      setState(prev => ({ ...prev, status: 'registering', progress: 20 }));
      const registrationResult = await signAndExecuteTransaction({
        transaction: flow.register({
          epochs: 30, // Default to 30 days
          deletable: true,
          owner: currentAccount.address,
        }),
      });

      // Get the digest from the registration result
      const digest = registrationResult.digest;
      if (!digest) {
        throw new Error('Failed to get digest from registration');
      }

      // Step 3: Upload to Relay
      setState(prev => ({ ...prev, status: 'uploading', progress: 50 }));
      
      // Set up progress event listener
      const handleProgress = (progress: number) => {
        // Map progress from 50-90% during upload
        const mappedProgress = 50 + (progress * 0.4);
        const roundedProgress = Math.round(mappedProgress);
        setState(prev => ({ ...prev, progress: roundedProgress }));
        onProgress?.(roundedProgress);
      };
      
      (flow as WriteFilesFlowWithEvents).on('progress', handleProgress);
      
      try {
        await flow.upload({ digest });
      } finally {
        // Clean up the event listener
        (flow as WriteFilesFlowWithEvents).off('progress', handleProgress);
      }

      // Step 4: Certify
      setState(prev => ({ ...prev, status: 'certifying', progress: 95 }));
      await signAndExecuteTransaction({
        transaction: flow.certify(),
      });

      // Get final result
      const result = await flow.listFiles();
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.walBalance(currentAccount.address) });
      queryClient.invalidateQueries({ queryKey: queryKeys.suiBalance(currentAccount.address) });

      setState({
        status: 'completed',
        progress: 100,
        error: null,
        result,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      throw error;
    }
  };

  return {
    upload,
    state,
    reset: () => setState({
      status: 'idle',
      progress: 0,
      error: null,
      result: null,
    }),
  };
}
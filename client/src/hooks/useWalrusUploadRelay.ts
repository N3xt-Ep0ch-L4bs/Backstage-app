import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { WalrusFile } from '@mysten/walrus';
import { useNetworkVariable } from '../networkConfig';
import { encryptWithSeal } from '../lib/seal';
import { suiClient, walrusClient } from '../lib/walrus';

// Removed unused interface

type UploadStatus = 'idle' | 'encoding' | 'encrypting' | 'registering' | 'uploading' | 'certifying' | 'completed' | 'error';

export type AccessPolicyType = 'wallet' | 'nft' | 'token' | 'public' | 'subscriber';

export interface AccessControlPolicy {
  type: AccessPolicyType;
  address: string;
  minBalance?: number;
}

interface UploadState {
  status: UploadStatus;
  progress: number;
  error: string | null;
  result: any;
}

export interface UploadOptions {
  file: File;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  isEncrypted?: boolean;
  keyStrength?: 128 | 256;
  accessControl?: {
    policies: AccessControlPolicy[];
  };
  onProgress?: (progress: number) => void;
}


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



  const updateState = (updates: Partial<UploadState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      ...(updates.status === 'error' && updates.error ? { result: null } : {})
    }));
  };

  const upload = async (options: UploadOptions) => {
    const {
      file,
      title,
      description,
      category,
      tags = [],
      isEncrypted = true,
      keyStrength = 256,
      accessControl,
      onProgress
    } = options;
    
    // Reset state at the start of upload
    updateState({ 
      status: 'idle', 
      progress: 0, 
      error: null, 
      result: null 
    });

    try {
      if (!currentAccount?.address) {
        const error = new Error('No wallet connected');
        updateState({ status: 'error', error: error.message });
        throw error;
      }
      // 1. Read and prepare file
      updateState({ status: 'encoding', progress: 10 });
      onProgress?.(10);

      const fileBuffer = await file.arrayBuffer();
      // Create a new ArrayBuffer to ensure proper typing
      const buffer = new ArrayBuffer(fileBuffer.byteLength);
      new Uint8Array(buffer).set(new Uint8Array(fileBuffer));
      let fileData: Uint8Array<ArrayBuffer> = new Uint8Array(buffer);
      let encryptionId: string | undefined;

      // 2. Encrypt if enabled
      if (isEncrypted) {
        if (!packageId) {
          const error = new Error('Package ID is undefined');
          updateState({ status: 'error', error: error.message });
          throw error;
        }
        updateState({ status: 'encrypting', progress: 20 });
        onProgress?.(20);

        // Ensure we have valid file data and buffer
        if (!fileData || !fileData.buffer) {
          const error = new Error('Invalid file data: buffer is undefined');
          updateState({ status: 'error', error: error.message });
          throw error;
        }

        // Handle different buffer types safely
        let uploadBuffer: ArrayBuffer;
        try {
          if (typeof SharedArrayBuffer !== 'undefined' && fileData.buffer instanceof SharedArrayBuffer) {
            // Create a new ArrayBuffer copy from SharedArrayBuffer
            const copy = new Uint8Array(fileData.length);
            copy.set(fileData);
            uploadBuffer = copy.buffer;
          } else {
            // Use the buffer directly if it's a regular ArrayBuffer
            uploadBuffer = fileData.buffer.slice(0); // Create a copy to avoid sharing the buffer
          }
        } catch (bufferError) {
          const error = new Error(`Failed to prepare file buffer: ${bufferError}`);
          updateState({ status: 'error', error: error.message });
          throw error;
        }

        const encryptionResult = await encryptWithSeal(
          suiClient,
          packageId,
          // Create a new Uint8Array with the buffer
          new Uint8Array(uploadBuffer)
        );

        fileData = encryptionResult.encryptedData as Uint8Array<ArrayBuffer>;
        encryptionId = encryptionResult.id;
      }

      // 3. Prepare metadata
      const metadata: Record<string, string> = {
        title,
        description,
        ...(category && { category }),
        tags: tags.join(','),
        isEncrypted: String(isEncrypted),
        keyStrength: String(keyStrength),
        ...(isEncrypted && encryptionId && { encryptionId }),
        ...(accessControl?.policies?.length && { 
          accessControl: JSON.stringify(accessControl.policies) 
        })
      };

      // 4. Create WalrusFile with metadata and store the file data separately
      const files = [
        WalrusFile.from({
          contents: fileData,
          identifier: isEncrypted ? `${file.name}.encrypted` : file.name,
          tags: {
            ...metadata,
            originalName: file.name,
            contentType: file.type
          },
        }),
      ];

      // Store the file data separately since we can't reliably access it from WalrusFile
      const fileContent = fileData;

      // 5. Initialize upload flow
      const flow = walrusClient.writeFilesFlow({ files });
      await flow.encode();
      updateState({ progress: 30 });

      // 6. Register file on-chain
      updateState({ status: 'registering', progress: 40 });
      const registrationResult = await signAndExecuteTransaction({
        transaction: flow.register({
          epochs: 30, // 30 days default
          deletable: true,
          owner: currentAccount.address,
        }),
      });

      const digest = registrationResult.digest;
      if (!digest) {
        throw new Error('Failed to get transaction digest');
      }

      // Get transaction details to extract deletable object ID
      const txBlock = await suiClient.getTransactionBlock({
        digest,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      const objectChanges = txBlock.objectChanges || [];
      console.log('Object changes:', JSON.stringify(objectChanges, null, 2));
      const createdChanges = objectChanges.filter((change: any) => change.type === 'created');
      console.log('Created changes:', JSON.stringify(createdChanges, null, 2));
      
      // Look for the Blob object in the created changes
      const blobChange = createdChanges.find((change: any) => 
        change.objectType && change.objectType.includes('blob::Blob')
      );
      console.log('Blob change:', blobChange);
      
      if (!blobChange) {
        throw new Error('Blob object not found in transaction');
      }
      const deletableBlobObject = (blobChange as any).objectId;

      // 7. Upload file data with timeout
      updateState({ status: 'uploading', progress: 50 });
      onProgress?.(50);

      try {
        // Generate a secure random nonce for the proxy request
        const nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();

        const timeout = 300000; // 5 minutes timeout

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Upload timed out after ${timeout/1000} seconds`));
          }, timeout);
        });

        // Manual upload using fetch to include all required query parameters
        const relayUrl = 'https://upload-relay.testnet.walrus.space/v1/blob-upload-relay';
        const blobId = await files[0].getIdentifier();
        if (!blobId) {
          throw new Error('Failed to generate blob identifier');
        }
        
        // Encode each parameter separately to ensure proper URL encoding
        const params = [
          `blob_id=${encodeURIComponent(blobId)}`,
          `deletable_blob_object=${encodeURIComponent(deletableBlobObject)}`,
          'encoding_type=RS2',
          `transaction_id=${encodeURIComponent(digest)}`,
          `nonce=${encodeURIComponent(nonce)}`
        ].join('&');
        
        const fullUrl = `${relayUrl}?${params}`;

        // Use the file content we stored earlier
        if (!fileContent) {
          throw new Error('No file data available for upload');
        }

        // Create a Blob from the Uint8Array
        const blob = new Blob([fileContent], { type: 'application/octet-stream' });

        const uploadPromise = fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          body: blob,
        }).then(async response => {
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload error details:', errorText);
            throw new Error(`Upload failed: ${response.status} ${response.statusText}: ${errorText}`);
          }
          return response;
        });

        await Promise.race([
          uploadPromise,
          timeoutPromise
        ]);

        updateState({ progress: 90 });
        onProgress?.(90);
      } catch (error) {
        console.error('Upload failed:', error);

        // Handle timeout specifically
        if (error instanceof Error && error.message.includes('timed out')) {
          const timeoutError = new Error(`Upload timed out after ${300000 / 1000} seconds. Please check your internet connection and try again.`);
          timeoutError.name = 'UploadTimeoutError';
          throw timeoutError;
        }
        throw error;
      }

      // 8. Finalize with certification
      updateState({ status: 'certifying', progress: 95 });
      await signAndExecuteTransaction({
        transaction: flow.certify(),
      });

      // 9. Get final result
      const result = await flow.listFiles();
      
      // 10. Update cache
      queryClient.invalidateQueries({ 
        queryKey: ['walrusFiles', currentAccount.address] 
      });

      updateState({
        status: 'completed',
        progress: 100,
        result,
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error('Upload error:', error);
      updateState({ 
        status: 'error', 
        error: errorMessage,
        progress: 0
      });
      // Rethrow with more context
      const enhancedError = new Error(`Upload failed: ${errorMessage}`);
      enhancedError.name = error instanceof Error ? error.name : 'UploadError';
      enhancedError.stack = error instanceof Error ? error.stack : undefined;
      throw enhancedError;
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

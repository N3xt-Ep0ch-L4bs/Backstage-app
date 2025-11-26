import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { WalrusFile } from '@mysten/walrus';
import { toBase64 } from '@mysten/sui/utils';
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
  result: unknown;
}

export interface UploadOptions {
  file: File;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
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
      /**
       * IMPORTANT: Encryption-First Flow (ALWAYS REQUIRED)
       * 
       * Videos are ALWAYS encrypted before upload. The process follows this order:
       * 1. Read file from disk/memory
       * 2. ENCRYPT the file data using SEAL (MANDATORY)
       * 3. Create WalrusFile with ENCRYPTED data
       * 4. Upload ENCRYPTED data to Walrus storage
       * 
       * This ensures that:
       * - Original video content is NEVER stored in plain text
       * - Only encrypted bytes are sent to Walrus
       * - Encryption happens BEFORE any network operations
       * - The encryptionId is stored in metadata for later decryption
       * - All videos are protected by default
       */
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
      const originalFileData: Uint8Array<ArrayBuffer> = new Uint8Array(buffer);

      // 2. Encrypt video (ALWAYS REQUIRED)
      console.log('[Upload] Encryption is MANDATORY - starting encryption process...');
      console.log('[Upload] File name:', file.name);
      console.log('[Upload] File type:', file.type);
      console.log('[Upload] File size:', file.size, 'bytes');
      console.log('[Upload] Key strength:', keyStrength);
      
        if (!packageId) {
        const error = new Error('Package ID is undefined - encryption cannot proceed');
          updateState({ status: 'error', error: error.message });
          throw error;
        }
        updateState({ status: 'encrypting', progress: 20 });
        onProgress?.(20);

        // Ensure we have valid file data and buffer
      if (!originalFileData || !originalFileData.buffer) {
          const error = new Error('Invalid file data: buffer is undefined');
          updateState({ status: 'error', error: error.message });
          throw error;
        }

      console.log('[Upload] Preparing file buffer for encryption...');
      console.log('[Upload] Original file data length:', originalFileData.length, 'bytes');
      
      // Check buffer type safely (SharedArrayBuffer may not be available in browser)
      const isSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined' && 
                                   originalFileData.buffer instanceof SharedArrayBuffer;
      console.log('[Upload] Buffer type:', isSharedArrayBuffer ? 'SharedArrayBuffer' : 'ArrayBuffer');

        // Handle different buffer types safely
        let uploadBuffer: ArrayBuffer;
        try {
        if (isSharedArrayBuffer) {
          console.log('[Upload] Converting SharedArrayBuffer to ArrayBuffer...');
            // Create a new ArrayBuffer copy from SharedArrayBuffer
          const copy = new Uint8Array(originalFileData.length);
          copy.set(originalFileData);
            uploadBuffer = copy.buffer;
          } else {
          console.log('[Upload] Using ArrayBuffer directly (creating copy)...');
            // Use the buffer directly if it's a regular ArrayBuffer
          uploadBuffer = originalFileData.buffer.slice(0); // Create a copy to avoid sharing the buffer
          }
        console.log('[Upload] Buffer prepared successfully, size:', uploadBuffer.byteLength, 'bytes');
        } catch (bufferError) {
        console.error('[Upload] Failed to prepare file buffer:', bufferError);
          const error = new Error(`Failed to prepare file buffer: ${bufferError}`);
          updateState({ status: 'error', error: error.message });
          throw error;
        }

      console.log('[Upload] Calling encryptWithSeal...');
        const encryptionResult = await encryptWithSeal(
          suiClient,
          packageId,
          // Create a new Uint8Array with the buffer
          new Uint8Array(uploadBuffer)
        );

      console.log('[Upload] Encryption completed, updating file data...');
      const encryptedBytes = encryptionResult.encryptedData as Uint8Array<ArrayBuffer>;
      const encryptionId = encryptionResult.id;
      console.log('[Upload] File data updated with encrypted data');
      console.log('[Upload] Encrypted data length:', encryptedBytes.length, 'bytes');
      console.log('[Upload] Encryption ID:', encryptionId);

      // 3. Verify encryption completed (MANDATORY)
      if (!encryptionId) {
        throw new Error('Encryption failed: encryption ID is missing');
      }
      if (encryptedBytes.length === 0) {
        throw new Error('Encryption failed: encrypted data is empty');
      }
      console.log('[Upload] ✓ Encryption verified - encrypted data ready for upload');
      console.log('[Upload] Original file size:', file.size, 'bytes');
      console.log('[Upload] Encrypted data size:', encryptedBytes.length, 'bytes');
      console.log('[Upload] Encryption overhead:', (encryptedBytes.length - file.size), 'bytes');

      // 4. Convert encrypted bytes to base64 using Sui SDK
      console.log('[Upload] Converting encrypted bytes to base64 using Sui SDK...');
      const base64String = toBase64(encryptedBytes);
      console.log('[Upload] Base64 conversion completed');
      console.log('[Upload] Base64 string length:', base64String.length, 'characters');
      console.log('[Upload] Base64 size vs original:', ((base64String.length / encryptedBytes.length) * 100).toFixed(2) + '%');

      // 5. Prepare metadata
      const metadata: Record<string, string> = {
        title,
        description,
        ...(category && { category }),
        tags: tags.join(','),
        isEncrypted: 'true', // Always true - encryption is mandatory
        keyStrength: String(keyStrength),
        encryptionId: encryptionId, // Always present - encryption is mandatory
        encoding: 'base64', // Mark that data is base64 encoded
        ...(accessControl?.policies?.length && { 
          accessControl: JSON.stringify(accessControl.policies) 
        })
      };

      // 6. Create WalrusFile with base64-encoded ENCRYPTED data (ALWAYS ENCRYPTED)
      // IMPORTANT: Only encrypted data goes to Walrus - encryption is mandatory
      // Data is base64 encoded for easier transmission
      console.log('[Upload] Creating WalrusFile with base64-encoded ENCRYPTED data...');
      // Convert base64 string to Uint8Array for WalrusFile
      const base64Bytes = new TextEncoder().encode(base64String);
      const files = [
        WalrusFile.from({
          contents: base64Bytes, // Base64-encoded encrypted data as bytes
          identifier: `${file.name}.encrypted`,
          tags: {
            ...metadata,
            originalName: file.name,
            contentType: file.type
          },
        }),
      ];

      // Store the original encrypted bytes for reference
      const fileContent = encryptedBytes;
      
      // Final verification: ensure we're uploading encrypted data (ALWAYS)
      console.log('[Upload] ✓ Final check: Uploading encrypted data to Walrus');
      console.log('[Upload] Data to upload length:', fileContent.length, 'bytes');
      console.log('[Upload] Encryption ID stored in metadata:', encryptionId);

      // 6. Upload files using writeFiles - this should combine operations into fewer transactions
      console.log('[Upload] Uploading files to Walrus using writeFiles...');
      console.log('[Upload] Data being uploaded is ENCRYPTED (mandatory)');
      
      updateState({ status: 'registering', progress: 40 });
      onProgress?.(40);

      // Use writeFilesFlow for better control with browser wallets
      // This allows us to handle each step separately and ensure proper transaction handling
      updateState({ status: 'uploading', progress: 50 });
      onProgress?.(50);

      const flow = walrusClient.writeFilesFlow({
        files,
      });

      // Step 1: Encode files
      await flow.encode();
      updateState({ status: 'registering', progress: 55 });
      onProgress?.(55);

      // Step 2: Register on-chain (this will trigger wallet popup)
      const registerTx = flow.register({ 
        epochs: 30, 
        deletable: true,
        owner: currentAccount.address,
      });
      registerTx.setSender(currentAccount.address);
      const registerResult = await signAndExecuteTransaction({ transaction: registerTx });
      await suiClient.waitForTransaction({ digest: registerResult.digest });
      updateState({ status: 'uploading', progress: 70 });
      onProgress?.(70);

      // Step 3: Upload to relay (this should not require a transaction)
      await flow.upload({ digest: registerResult.digest });
      updateState({ status: 'certifying', progress: 85 });
      onProgress?.(85);

      // Step 4: Certify on-chain (this will trigger wallet popup)
      const certifyTx = flow.certify();
      certifyTx.setSender(currentAccount.address);
      const certifyResult = await signAndExecuteTransaction({ transaction: certifyTx });
      await suiClient.waitForTransaction({ digest: certifyResult.digest });
      updateState({ status: 'certifying', progress: 95 });
      onProgress?.(95);

      // Get the result
      const result = flow.listFiles();

      updateState({ status: 'certifying', progress: 95 });
      onProgress?.(95);

      console.log('[Upload] Upload completed successfully!');
      updateState({ status: 'certifying', progress: 95 });
      onProgress?.(95);
      
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

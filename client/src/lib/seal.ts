import { SealClient, SessionKey, NoAccessError, EncryptedObject } from '@mysten/seal';
import { toHex } from '@mysten/sui/utils';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';

type MoveCallConstructor = (tx: Transaction, id: string) => void;


export const serverObjectIds = ["0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8"];

export function createSealClient(suiClient: SuiClient): SealClient {
  return new SealClient({
    suiClient,
    serverConfigs: serverObjectIds.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  });
}

export async function encryptWithSeal(
  suiClient: SuiClient,
  packageId: string,
  data: Uint8Array
): Promise<{ encryptedData: Uint8Array; id: string }> {
  const client = createSealClient(suiClient);
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const id = toHex(nonce);
  
  const { encryptedObject: encryptedData } = await client.encrypt({
    threshold: 2,
    packageId,
    id,
    data,
  });

  return { encryptedData, id };
}

export async function decryptWithSeal(
  suiClient: SuiClient,
  encryptedData: Uint8Array,
  sessionKey: SessionKey,
  moveCallConstructor: MoveCallConstructor
): Promise<Uint8Array> {
  try {
    const client = createSealClient(suiClient);
    
    // Parse the encrypted object to get its ID
    const encryptedObject = EncryptedObject.parse(encryptedData);
    
    // Create and build the transaction
    const tx = new Transaction();
    moveCallConstructor(tx, encryptedObject.id);
    const txBytes = await tx.build({ 
      client: suiClient, 
      onlyTransactionKind: true 
    });
    
    // Fetch the decryption keys first
    await client.fetchKeys({
      ids: [encryptedObject.id],
      txBytes,
      sessionKey,
      threshold: 2
    });
    
    // Then decrypt the data
    const decryptedData = await client.decrypt({
      data: encryptedData,
      sessionKey,
      txBytes,
    });
    
    return decryptedData;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error instanceof NoAccessError 
      ? new Error('No access to decryption keys') 
      : new Error('Failed to decrypt data');
  }
}

export async function createSessionKey(
  suiClient: SuiClient,
  address: string,
  packageId: string,
  ttlMinutes: number = 10
): Promise<SessionKey> {
  return SessionKey.create({
    address,
    packageId,
    ttlMin: ttlMinutes,
    suiClient,
  });
}

export function getBlobUrl(blobId: string, serviceUrl: string): string {
  return `${serviceUrl}/v1/blobs/${blobId}`;
}
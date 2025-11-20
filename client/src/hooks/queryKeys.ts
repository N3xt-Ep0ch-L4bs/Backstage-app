export const queryKeys = {
  
  storageCost: (fileSize: number, epochs: number) => [
    "storageCost",
    fileSize,
    epochs,
  ],
  currentEpoch: () => ["currentEpoch"],
  suiBalance: (address?: string) => ["suiBalance", address],
  walBalance: (address?: string) => ["walBalance", address],
  
  uploadStatus: (uploadId?: string) => ["uploadStatus", uploadId],
  userUploads: (address?: string) => ["userUploads", address],
  uploadProgress: (uploadId: string) => ["uploadProgress", uploadId],
  uploadHistory: (filters?: UploadHistoryFilters) => [
    "uploadHistory",
    filters,
  ],
} as const;


export type UploadHistoryFilters = {
  status?: "pending" | "completed" | "failed";
  fromDate?: Date;
  toDate?: Date;
  fileType?: string;
};
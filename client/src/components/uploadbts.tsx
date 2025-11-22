import { useState, useCallback } from "react";
import { CloudUpload, X } from "lucide-react";
import "./uploadbts.css";
import { useWalrusUploadRelay } from '../hooks/useWalrusUploadRelay';
import { useVideoAccess } from '../hooks/useVideoAccess';
import { useSuiClient } from '@mysten/dapp-kit';
import { decryptWithSeal, createSessionKey, getBlobUrl } from '../lib/seal';

const UploadBTS: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const { upload } = useWalrusUploadRelay();
  const { createVideo } = useVideoAccess();
  const suiClient = useSuiClient();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Pricing related state
  const [price, setPrice] = useState<number>(0); // in SUI
  // Access time-to-live in days; 0 means lifetime
  const [ttlDays, setTtlDays] = useState<number>(0);
  // Scarcity related state
  const [scarcity, setScarcity] = useState<"unlimited" | "limited">("unlimited");
  const [limitCount, setLimitCount] = useState<number>(0);

  // Upload result blob id, used for create video
  const [blobId, setBlobId] = useState<string | null>(null);

  // Download & decrypt state
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1:
        return file !== null;
      case 2:
        return title.trim() !== '' && category !== '';
      case 3:
        return price >= 0 && (ttlDays >= 0);
      default:
        return true;
    }
  }, [step, file, title, category, price, ttlDays]);

  // Handle actual publish flow: upload encrypted file then create video on-chain
  const handlePublish = useCallback(async (): Promise<void> => {
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload file through walrus relay (encrypt happens in the hook)
      const uploadResult = await upload({
        file,
        title,
        description,
        category,
        tags,
        isEncrypted: true,
        onProgress: (progress: number) => {
          // Optional: update progress UI if needed
          console.log(`Upload progress: ${progress}%`);
        },
      });

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Upload failed: no result returned");
      }

      const latestFile = uploadResult[uploadResult.length - 1];
      // Adjusted from identifier to blobId property based on upload result type
      const walrusBlobId = latestFile.blobId ?? latestFile.blobObject?.blob_id ?? "";
      setBlobId(walrusBlobId);

      // 2. Prepare arguments for createVideo call
      const priceInMist = Math.floor(price * 1_000_000_000); // SUI to MIST
      const ttlMs = ttlDays > 0 ? ttlDays * 24 * 60 * 60 * 1000 : 0; // days to ms
      const scarcityNum = scarcity === "limited" ? limitCount : 0;

      // 3. Call createVideo mutation (to smart contract)
      await createVideo.mutateAsync({
        title,
        description,
        category,
        tags,
        blobId: walrusBlobId,
        price: priceInMist,
        ttl: ttlMs,
        scarcity: scarcityNum,
      });

      setStep(5); // Success step
    } catch (error) {
      console.error('Upload or publish failed:', error);
      alert(error instanceof Error ? error.message : 'Unknown error during upload/publish');
    } finally {
      setIsUploading(false);
    }
  }, [file, title, description, category, tags, price, ttlDays, scarcity, limitCount, upload, createVideo]);

  // Handle file selection from input or drag drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep(2);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStep(2);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Add and remove tags handlers
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = useCallback((tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  }, [tags]);

  // Navigation handlers
  const goNext = useCallback((): void => {
    if (step === 1 && !file) return;
    if (step === 2 && (!title.trim() || !category)) return;
    if (step < 4) setStep((s) => s + 1);
    else {
      console.log("Publishing...");
      handlePublish();
    }
  }, [step, file, title, category, handlePublish]);

  const goBack = useCallback((): void => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  // Handle decrypt and download flow
  const handleDecryptAndDownload = useCallback(async () => {
    if (!blobId || !file) {
      alert("No file or blob available to decrypt.");
      return;
    }
    setIsUploading(true);
    try {
      // Create session key with 10 min TTL
      const sessionKeyObj = await createSessionKey(suiClient, '', '', 10);

      // Fetch blob as Uint8Array from Walrus endpoint
      const serviceUrl = import.meta.env.VITE_WALRUS_BASE_URL || ''; // Use Vite env variable
      const blobUrl = getBlobUrl(blobId, serviceUrl);
      const response = await fetch(blobUrl);
      if (!response.ok) throw new Error('Failed to fetch encrypted blob for decryption');
      const encryptedData = new Uint8Array(await response.arrayBuffer());

      // Decrypt using Seal
      const decryptedData = await decryptWithSeal(
        suiClient,
        encryptedData,
        sessionKeyObj,
        () => {
          // Empty moveCallConstructor for decryption
        }
      );

      // To avoid SharedArrayBuffer issue, create a new Uint8Array copy
      const buffer = decryptedData.buffer instanceof SharedArrayBuffer
        ? new Uint8Array(decryptedData).buffer
        : decryptedData.buffer;
      const blob = new Blob([buffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      setDecryptedUrl(url);
    } catch (error) {
      console.error('Decryption failed:', error);
      alert(error instanceof Error ? error.message : 'Decryption failed');
    } finally {
      setIsUploading(false);
    }
  }, [blobId, file, suiClient]);

  // JSX rendering for each step
  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="upload-step">
            <h2>Upload Your File</h2>
            <div className="file-upload-area" onDrop={handleDrop} onDragOver={handleDragOver}>
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*,image/*"
                className="file-input"
              />
              <div className="upload-prompt">
                <CloudUpload size={48} />
                <p>Drag and drop your file here or click to browse</p>
                {file && <p>Selected file: {file.name}</p>}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="details-step">
            <h2>Add Details</h2>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description"
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select a category</option>
                <option value="Documentary">Documentary</option>
                <option value="Behind the Scenes">Behind the Scenes</option>
                <option value="Filmmaking">Filmmaking</option>
                <option value="Travel">Travel</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tags</label>
              <div className="tags-box">
                {tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                    <X size={14} onClick={() => removeTag(tag)} style={{cursor: 'pointer'}} />
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder="Press Enter to add tag"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="pricing-step">
            <h2>Pricing & Access</h2>
            <div className="form-group">
              <label>Price (SUI)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Access Duration (days, 0 for lifetime)</label>
              <input
                type="number"
                min="0"
                value={ttlDays}
                onChange={(e) => setTtlDays(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Scarcity</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    checked={scarcity === "unlimited"}
                    onChange={() => setScarcity("unlimited")}
                  />
                  Unlimited
                </label>
                <label>
                  <input
                    type="radio"
                    checked={scarcity === "limited"}
                    onChange={() => setScarcity("limited")}
                  />
                  Limited
                </label>
              </div>
              {scarcity === "limited" && (
                <div className="form-group">
                  <label>Limit Count</label>
                  <input
                    type="number"
                    min="1"
                    value={limitCount}
                    onChange={(e) => setLimitCount(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="review-step">
            <h2>Review & Publish</h2>
            <div className="review-section">
              <h3>Content Details</h3>
              <p><strong>Title:</strong> {title}</p>
              <p><strong>Description:</strong> {description}</p>
              <p><strong>Category:</strong> {category}</p>
              <p><strong>Tags:</strong> {tags.join(', ')}</p>
            </div>
            <div className="review-section">
              <h3>Pricing & Access</h3>
              <p><strong>Price:</strong> {price} SUI</p>
              <p><strong>Access:</strong> {ttlDays === 0 ? 'Lifetime' : `${ttlDays} days`}</p>
              <p><strong>Scarcity:</strong> {scarcity === 'unlimited' ? 'Unlimited' : `${limitCount} copies`}</p>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="success-step">
            <h2>Upload Successful!</h2>
            <p>Your content has been successfully published.</p>
            <button onClick={() => {
              setStep(1); setFile(null); setBlobId(null); setDecryptedUrl(null);
              setTitle(''); setDescription(''); setCategory(''); setTags([]);
              setPrice(0); setTtlDays(0); setScarcity('unlimited'); setLimitCount(0);
            }}>Upload Another File</button>
            {blobId && (
              <>
                <button onClick={handleDecryptAndDownload} disabled={isUploading}>
                  {isUploading ? 'Decrypting...' : 'Decrypt & Download'}
                </button>
                {decryptedUrl && (
                  <a href={decryptedUrl} download={file?.name} target="_blank" rel="noopener noreferrer">
                    Download Decrypted File
                  </a>
                )}
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="upload-container">
      {renderStep()}
      <div className="navigation-buttons">
        {step > 1 && step < 5 && (
          <button onClick={goBack} className="back-button" type="button">
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={goNext}
            className="next-button"
            type="button"
            disabled={!canProceed()}
          >
            Continue
          </button>
        ) : step === 4 ? (
          <button
            onClick={handlePublish}
            className="publish-button"
            disabled={isUploading}
            type="button"
          >
            {isUploading ? 'Publishing...' : 'Publish'}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default UploadBTS;

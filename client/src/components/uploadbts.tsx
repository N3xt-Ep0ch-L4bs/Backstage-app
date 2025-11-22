// UploadBTS.tsx
import React, { useCallback, useState } from "react";
import { CloudUpload, X, PlayCircle, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./uploadbts.css";

// backend hooks & libs (unchanged)
import { useWalrusUploadRelay } from '../hooks/useWalrusUploadRelay';
import { useVideoAccess } from '../hooks/useVideoAccess';
import { useSuiClient } from '@mysten/dapp-kit';
import { decryptWithSeal, createSessionKey, getBlobUrl } from '../lib/seal';

const UploadBTS: React.FC = () => {
  // ----------------------------
  // backend-related state (unchanged)
  // ----------------------------
  const { upload } = useWalrusUploadRelay();
  const { createVideo } = useVideoAccess();
  const suiClient = useSuiClient();

  const [file, setFile] = useState<File | null>(null);
  const [blobId, setBlobId] = useState<string | null>(null);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);

  // content meta
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // pricing / access (kept as original; number types for backend)
  const [price, setPrice] = useState<number>(0); // SUI
  const [ttlDays, setTtlDays] = useState<number>(0);
  const [scarcity, setScarcity] = useState<"unlimited" | "limited">("unlimited");
  const [limitCount, setLimitCount] = useState<number>(0);

  // flow & UI
  const [step, setStep] = useState<number>(1);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const navigate = useNavigate();

  // ----------------------------
  // helper / validators
  // ----------------------------
  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1:
        return file !== null;
      case 2:
        return title.trim() !== "" && category !== "";
      case 3:
        return price >= 0 && ttlDays >= 0;
      default:
        return true;
    }
  }, [step, file, title, category, price, ttlDays]);

  // ----------------------------
  // core publish flow (unchanged)
  // ----------------------------
  const handlePublish = useCallback(async (): Promise<void> => {
    if (!file) return;

    setIsUploading(true);
    let uploadSuccess = false;
    let walrusBlobId = '';

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
          console.log(`Upload progress: ${progress}%`);
        },
      });

      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Upload failed: no result returned");
      }

      const latestFile = uploadResult[uploadResult.length - 1];
      walrusBlobId = latestFile.blobId ?? latestFile.blobObject?.blob_id ?? "";
      setBlobId(walrusBlobId);
      uploadSuccess = true;

      // 2. Prepare args for createVideo
      const priceInMist = Math.floor(price * 1_000_000_000); // SUI to MIST
      const ttlMs = ttlDays > 0 ? ttlDays * 24 * 60 * 60 * 1000 : 0;
      const scarcityNum = scarcity === "limited" ? limitCount : 0;

      // 3. Call createVideo mutation (smart contract)
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

      setStep(5); // success
    } catch (error) {
      console.error("Upload or publish failed:", error);
      alert(error instanceof Error ? error.message : "Unknown error during upload/publish");
    } finally {
      setIsUploading(false);
    }
  }, [
    file,
    title,
    description,
    category,
    tags,
    price,
    ttlDays,
    scarcity,
    limitCount,
    upload,
    createVideo,
  ]);

  // ----------------------------
  // decrypt & download (unchanged)
  // ----------------------------
  const handleDecryptAndDownload = useCallback(async () => {
    if (!blobId || !file) {
      alert("No file or blob available to decrypt.");
      return;
    }
    setIsUploading(true);
    try {
      const sessionKeyObj = await createSessionKey(suiClient, '', '', 10);
      const serviceUrl = import.meta.env.VITE_WALRUS_BASE_URL || '';
      const blobUrl = getBlobUrl(blobId, serviceUrl);
      const response = await fetch(blobUrl);
      if (!response.ok) throw new Error('Failed to fetch encrypted blob for decryption');
      const encryptedData = new Uint8Array(await response.arrayBuffer());

      const decryptedData = await decryptWithSeal(
        suiClient,
        encryptedData,
        sessionKeyObj,
        () => {}
      );

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

  // ----------------------------
  // file / drag handlers
  // ----------------------------
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

  // tags
  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = useCallback((tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  }, [tags]);

  // navigation
  const goNext = useCallback(() => {
    if (step === 1 && !file) return;
    if (step === 2 && (!title.trim() || !category)) return;
    if (step < 4) setStep((s) => s + 1);
    else {
      handlePublish();
    }
  }, [step, file, title, category, handlePublish]);

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  // reset after success
  const resetAll = useCallback(() => {
    setStep(1);
    setFile(null);
    setBlobId(null);
    setDecryptedUrl(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setTags([]);
    setPrice(0);
    setTtlDays(0);
    setScarcity('unlimited');
    setLimitCount(0);
  }, []);

  // ----------------------------
  // Render UI (structured like second file, but wired to original logic)
  // ----------------------------
  return (
    <div className="upload-container">
      {/* Step indicator */}
      {step !== 5 && (
        <div className="upload-steps">
          <div className={`step ${step > 1 ? "completed" : step === 1 ? "active" : ""}`}>
            1<br /><span>Upload File</span>
          </div>
          <div className={`step ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
            2<br /><span>Content Details</span>
          </div>
          <div className={`step ${step === 3 ? "active" : step > 3 ? "completed" : ""}`}>
            3<br /><span>Pricing & Access</span>
          </div>
          <div className={`step ${step === 4 ? "active" : ""}`}>
            4<br /><span>Review & Publish</span>
          </div>
        </div>
      )}

      {/* STEP 1 — Upload */}
      {step === 1 && (
        <>
          <h1 className="upload-title">Upload Your BTS Video</h1>
          <p className="upload-subtitle">Supported formats: MP4, MOV, AVI • Max size: 5GB • Secure storage on Walrus</p>

          <div
            className="upload-dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <CloudUpload size={40} color="#1D4ED8" />
            <p>{file ? file.name : "Drag & drop your video here"}</p>

            <label className="browse-btn">
              Browse Files
              <input type="file" accept="video/*" onChange={handleFileChange} />
            </label>

            <p className="supported-formats">Supported formats: MP4, MOV, AVI, MKV, WEBM</p>
          </div>
        </>
      )}

      {/* STEP 2 — Content Details */}
      {step === 2 && (
        <div className="details-container">
          <h2 className="section-title">Content Details</h2>

          <label className="input-label">Title *</label>
          <input
            className="text-input"
            placeholder="e.g., Behind the Scenes: Documentary Filming in Iceland"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="input-label">Description *</label>
          <textarea
            className="textarea-input"
            placeholder="Describe what viewers will learn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <label className="input-label">Category *</label>
          <select
            className="select-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select category</option>
            <option value="Documentary">Documentary</option>
            <option value="Behind the Scenes">Behind the Scenes</option>
            <option value="Filmmaking">Filmmaking</option>
            <option value="Travel">Travel</option>
          </select>

          <label className="input-label">Tags</label>
          <div className="tags-box">
            {tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
                <X size={14} onClick={() => removeTag(tag)} style={{ cursor: "pointer" }} />
              </span>
            ))}
            <input
              className="tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Press Enter to add tag"
            />
          </div>

          <label className="input-label">Content Advisory</label>
          <div className="advisory-box">
            <label><input type="checkbox" /> Contains strong language</label>
            <label><input type="checkbox" /> Contains sensitive content</label>
            <label><input type="checkbox" /> Mature themes</label>
          </div>
        </div>
      )}

      {/* STEP 3 — Pricing & Access */}
      {step === 3 && (
        <div className="pricing-container">
          <h2 className="section-title">Set Pricing & Access Control</h2>
          <p className="section-sub">Choose how fans can access your BTS content, pricing, SEAL controls, and scarcity settings.</p>

          <div className="block">
            <h3 className="block-title">Set Your Price</h3>
            <div className="price-input-box">
              <input
                type="number"
                className="price-input"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                min={0}
                step={0.01}
              />
              <span className="price-unit">SUI</span>
            </div>
          </div>

          <div className="block">
            <h3 className="block-title">How long can viewers access this content?</h3>
            <div className="toggle-tabs">
              <button className={ttlDays === 0 ? "active" : ""} onClick={() => setTtlDays(0)}>Lifetime Access</button>
              <button className={ttlDays > 0 ? "active" : ""} onClick={() => { if (ttlDays === 0) setTtlDays(7); }}>Time-Limited</button>
            </div>

            {ttlDays > 0 && (
              <div className="days-input-box">
                <input
                  type="number"
                  placeholder="Enter number of days"
                  value={ttlDays}
                  onChange={(e) => setTtlDays(parseInt(e.target.value) || 0)}
                />
                <span>days</span>
              </div>
            )}
          </div>

          <div className="block">
            <h3 className="block-title">Create Scarcity</h3>

            <div className="scarcity-options">
              <div className={`scarcity-card ${scarcity === "unlimited" ? "selected" : ""}`} onClick={() => setScarcity("unlimited")}>
                <span className="scarcity-title">Unlimited Availability</span>
                <p>No cap on the number of purchases.</p>
              </div>

              <div className={`scarcity-card ${scarcity === "limited" ? "selected" : ""}`} onClick={() => setScarcity("limited")}>
                <span className="scarcity-title">Limited Edition Drop</span>
                <p>Create demand by limiting purchases.</p>
              </div>
            </div>

            {scarcity === "limited" && (
              <div className="limit-input-box">
                <input
                  type="number"
                  placeholder="Enter max number of copies"
                  value={limitCount}
                  onChange={(e) => setLimitCount(parseInt(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          <div className="block">
            <h3 className="block-title">Marketplace Preview</h3>
            <div className="preview-card">
              <div className="preview-thumb">
                {file ? (
                  // show an icon or a small poster placeholder
                  <div className="preview-thumb-inner">▶</div>
                ) : (
                  <div className="preview-thumb-placeholder">No file</div>
                )}
              </div>

              <div className="preview-info">
                <h4>{title || "Untitled BTS Video"}</h4>
                <p className="preview-desc">{description || "Your video description will appear here."}</p>
                <div className="preview-price">{price || "0"} SUI</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 — Review & Publish */}
      {step === 4 && (
        <div className="reviewPublish-container">
          <h2 className="reviewPublish-title">Review & Publish</h2>
          <p className="reviewPublish-sub">Double-check all fields before publishing.</p>

          <div className="reviewPublish-grid">
            <div className="reviewPublish-left">
              <div className="reviewPublish-videoCard">
                <div className="reviewPublish-thumbWrapper">
                  <div className="reviewPublish-thumbPlaceholder">Preview</div>
                  <PlayCircle size={48} className="reviewPublish-playIcon" />
                </div>

                <div className="reviewPublish-videoInfo">
                  <h3>{title}</h3>
                  <button className="reviewPublish-editBtn" onClick={() => setStep(2)}><Edit size={14} /> Edit Details</button>
                </div>
              </div>

              <div className="reviewPublish-sectionBox">
                <h4>Content Details</h4>
                <p>{description}</p>
                <div><strong>Category:</strong> {category}</div>
                <div><strong>Tags:</strong> {tags.join(", ")}</div>
                <div><strong>File Name:</strong> {file?.name}</div>
                <div><strong>Format:</strong> {file?.type}</div>
              </div>
            </div>

            <div className="reviewPublish-right">
              <div className="reviewPublish-sideBox">
                <h4>Pricing & Access</h4>
                <div className="reviewPublish-row"><span>Price:</span> {price || 0} SUI</div>
                <div className="reviewPublish-row"><span>Access:</span> {ttlDays === 0 ? "Lifetime" : `${ttlDays} Days`}</div>
                <div className="reviewPublish-row"><span>Scarcity:</span> {scarcity === "unlimited" ? "Unlimited" : `${limitCount} copies`}</div>
              </div>

              <div className="reviewPublish-sideBox">
                <h4>On-Chain</h4>
                <div className="reviewPublish-row"><span>Blob ID:</span> {blobId ?? "—"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5 — Success */}
      {step === 5 && (
        <div className="publishSuccess-overlay">
          <div className="publishSuccess-container">
            <div className="publishSuccess-icon">
              <div className="circle"><span className="check">✔</span></div>
            </div>
            <h1 className="publishSuccess-title">Content Published Successfully! 🎉</h1>
            <p className="publishSuccess-sub">Your behind-the-scenes content is now live on the marketplace.</p>

            <div className="publishSuccess-infoBox">
              <div className="info-row"><span>Your content is now available to</span><strong>50,000+ fans</strong></div>
              <div className="info-row"><span>Transaction hash</span><strong>0x7k4n...m9b2</strong></div>
              <div className="info-row"><span>Published on</span><strong>{new Date().toLocaleString()}</strong></div>
            </div>

            <h2 className="publishSuccess-nextTitle">What's Next?</h2>

            <div className="publishSuccess-nextList">
              <button className="next-item" onClick={() => console.log("Share content")}>
                <div className="next-left"><div className="next-icon">🔗</div><div><h4>Share Your Content</h4><p>Promote your new content to your audience</p></div></div>
                <div className="next-arrow">→</div>
              </button>

              <button className="next-item" onClick={() => navigate("/marketplace")}>
                <div className="next-left"><div className="next-icon">🛒</div><div><h4>View in Marketplace</h4><p>See how your content appears to buyers</p></div></div>
                <div className="next-arrow">→</div>
              </button>

              <button className="next-item" onClick={() => console.log("Track performance")}>
                <div className="next-left"><div className="next-icon">📊</div><div><h4>Track Performance</h4><p>Monitor views, sales, and earnings</p></div></div>
                <div className="next-arrow">→</div>
              </button>
            </div>

            <div className="publishSuccess-buttons">
              <button className="uploadMore-btn" onClick={resetAll}>+ Upload Another Video</button>
              <button className="returnDashboard-btn" onClick={() => navigate("/dashboard")}>Return to Dashboard</button>
            </div>
          </div>
        </div>
      )}

      {/* Step buttons (visible except on success) */}
      {step !== 5 && (
        <div className="step-buttons">
          <button className="btn secondary" onClick={goBack} disabled={step === 1}>Back</button>
          <button
            className="btn primary"
            onClick={step < 4 ? goNext : handlePublish}
            disabled={isUploading || !canProceed()}
          >
            {step < 4 ? "Next" : isUploading ? "Publishing..." : "Publish"}
          </button>
        </div>
      )}

      {/* On success, show decrypt & download options if available */}
      {step === 5 && blobId && (
        <div className="decrypt-actions" style={{ textAlign: 'center', marginTop: 12 }}>
          <button onClick={handleDecryptAndDownload} disabled={isUploading}>
            {isUploading ? 'Decrypting...' : 'Decrypt & Download'}
          </button>

          {decryptedUrl && (
            <a href={decryptedUrl} download={file?.name} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 12 }}>
              Download Decrypted File
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadBTS;

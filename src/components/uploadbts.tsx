import { useState } from "react";
import React from "react";
import { CloudUpload, X } from "lucide-react";
import "./UploadBTS.css";

const UploadBTS: React.FC = () => {
  const [step, setStep] = useState<number>(1);

  const [file, setFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [thumbnailMode, setThumbnailMode] = useState("auto");
  const [customThumbnail, setCustomThumbnail] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep(2);
    }
  };
  
  const [pricingModel, setPricingModel] = useState("ppv");
  const [price, setPrice] = useState("");

  const [accessType, setAccessType] = useState("lifetime");
  const [accessDays, setAccessDays] = useState("");

  const [scarcity, setScarcity] = useState("unlimited");
  const [limitCount, setLimitCount] = useState("");

  const [proofType, setProofType] = useState("Proof-of-View");
  const [copyLimit, setCopyLimit] = useState("1");
  const [keyStrength, setKeyStrength] = useState("256-bit");

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

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const goNext = () => {
    // basic validations
    if (step === 1 && !file) return;
    if (step === 2 && (!title.trim() || !category)) return;
    if (step < 4) setStep((s) => s + 1);
    else {
      // publish action placeholder
      console.log("Publish payload:", { file, title, description, category, tags });
      alert("Publishing (placeholder) — check console for payload.");
    }
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <div className="upload-container">
      {/* Steps Section */}
      <div className="upload-steps">
        <div className={`step ${step > 1 ? "completed" : step === 1 ? "active" : ""}`}>
          1<br/><span>Upload File</span>
        </div>
        <div className={`step ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
          2<br/><span>Content Details</span>
        </div>
        <div className={`step ${step === 3 ? "active" : step > 3 ? "completed" : ""}`}>
          3<br/><span>Pricing & Access</span>
        </div>
        <div className={`step ${step === 4 ? "active" : ""}`}>
          4<br/><span>Review & Publish</span>
        </div>
      </div>

      {/* STEP 1 — Upload */}
      {step === 1 && (
        <>
          <h1 className="upload-title">Upload Your BTS Video</h1>
          <p className="upload-subtitle">
            Supported formats: MP4, MOV, AVI • Max size: 5GB • Secure storage on Walrus
          </p>

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

            <p className="supported-formats">
              Supported formats: MP4, MOV, AVI, MKV, WEBM
            </p>
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

          <label className="input-label">Custom Thumbnail</label>
          <div className="thumbnail-options">
            <div
              className={`thumbnail-option ${thumbnailMode === "auto" ? "selected" : ""}`}
              onClick={() => setThumbnailMode("auto")}
            >
              Auto-generate from video
            </div>

            <div
              className={`thumbnail-option ${thumbnailMode === "custom" ? "selected" : ""}`}
              onClick={() => setThumbnailMode("custom")}
            >
              Upload custom thumbnail
            </div>
          </div>

          {thumbnailMode === "custom" && (
            <div className="thumbnail-upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setCustomThumbnail(e.target.files[0])}
              />
              {customThumbnail && <p>{customThumbnail.name}</p>}
            </div>
          )}

          <label className="input-label">Content Advisory</label>
          <div className="advisory-box">
            <label><input type="checkbox" /> Contains strong language</label>
            <label><input type="checkbox" /> Contains sensitive content</label>
            <label><input type="checkbox" /> Mature themes</label>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="pricing-container">

          <h2 className="section-title">Set Pricing & Access Control</h2>
          <p className="section-sub">
            Choose how fans can access your BTS content, pricing, SEAL controls, and scarcity settings.
          </p>

          {/* Pricing Model */}
          <div className="block">
            <h3 className="block-title">Choose Your Pricing Model</h3>

            <div className="pricing-options">
              <div
                className={`pricing-card ${pricingModel === "ppv" ? "selected" : ""}`}
                onClick={() => setPricingModel("ppv")}
              >
                <div className="pricing-card-title">Pay-Per-View (PPV)</div>
                <p>One-time payment required to unlock the content.</p>
              </div>

              <div
                className={`pricing-card ${pricingModel === "subscription" ? "selected" : ""}`}
                onClick={() => setPricingModel("subscription")}
              >
                <div className="pricing-card-title">Subscription Access</div>
                <p>Available only to users with an active creator subscription.</p>
              </div>
            </div>
          </div>

          {/* Set Price */}
          <div className="block">
            <h3 className="block-title">Set Your Price</h3>

            <div className="price-input-box">
              <input
                type="number"
                className="price-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <span className="price-unit">SUI</span>
            </div>
          </div>

          {/* Access Duration */}
          <div className="block">
            <h3 className="block-title">How long can viewers access this content?</h3>

            <div className="toggle-tabs">
              <button
                className={accessType === "lifetime" ? "active" : ""}
                onClick={() => setAccessType("lifetime")}
              >
                Lifetime Access
              </button>

              <button
                className={accessType === "timed" ? "active" : ""}
                onClick={() => setAccessType("timed")}
              >
                Time-Limited
              </button>
            </div>

            {accessType === "timed" && (
              <div className="days-input-box">
                <input
                  type="number"
                  placeholder="Enter number of days"
                  value={accessDays}
                  onChange={(e) => setAccessDays(e.target.value)}
                />
                <span>days</span>
              </div>
            )}
          </div>

          {/* Scarcity Settings */}
          <div className="block">
            <h3 className="block-title">Create Scarcity</h3>

            <div className="scarcity-options">
              <div
                className={`scarcity-card ${scarcity === "unlimited" ? "selected" : ""}`}
                onClick={() => setScarcity("unlimited")}
              >
                <span className="scarcity-title">Unlimited Availability</span>
                <p>No cap on the number of purchases.</p>
              </div>

              <div
                className={`scarcity-card ${scarcity === "limited" ? "selected" : ""}`}
                onClick={() => setScarcity("limited")}
              >
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
                  onChange={(e) => setLimitCount(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* SEAL Security */}
          <div className="block">
            <h3 className="block-title">SEAL Security Settings</h3>

            <div className="seal-box">

              <div className="seal-row">
                <span>Proof Type</span>
                <select
                  className="select-input"
                  value={proofType}
                  onChange={(e) => setProofType(e.target.value)}
                >
                  <option>Proof-of-View</option>
                  <option>Proof-of-Purchase</option>
                </select>
              </div>

              <div className="seal-row">
                <span>Max Copies per User</span>
                <input
                  type="number"
                  className="text-input"
                  value={copyLimit}
                  onChange={(e) => setCopyLimit(e.target.value)}
                />
              </div>

              <div className="seal-row">
                <span>Asset Key Strength</span>
                <select
                  className="select-input"
                  value={keyStrength}
                  onChange={(e) => setKeyStrength(e.target.value)}
                >
                  <option>256-bit</option>
                  <option>512-bit</option>
                </select>
              </div>

              <details className="advanced-settings">
                <summary>Advanced NFT Configuration</summary>
                <div className="advanced-box">
                  <label>Metadata Mutability</label>
                  <select>
                    <option>Immutable</option>
                    <option>Editable</option>
                  </select>

                  <label>Transfer Permissions</label>
                  <select>
                    <option>Locked</option>
                    <option>Free Transfer</option>
                  </select>
                </div>
              </details>
            </div>
          </div>

          {/* Marketplace Preview */}
          <div className="block">
            <h3 className="block-title">Marketplace Preview</h3>

            <div className="preview-card">
              <div className="preview-thumb"></div>

              <div className="preview-info">
                <h4>{title || "Untitled BTS Video"}</h4>
                <p className="preview-desc">
                  {description || "Your video description will appear here."}
                </p>

                <div className="preview-price">{price || "0"} SU</div>
              </div>
            </div>
          </div>

        </div>
      )}


      {/* STEP 4 — Review & Publish (placeholder) */}
      {step === 4 && (
        <div className="details-container">
          <h2 className="section-title">Review & Publish</h2>
          <p className="muted">Review all fields and publish. (Placeholder)</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="step-buttons">
        <button
          className="btn secondary"
          onClick={goBack}
          disabled={step === 1}
        >
          Back
        </button>

        <button
          className="btn primary"
          onClick={goNext}
          disabled={
            (step === 1 && !file) ||
            (step === 2 && (!title.trim() || !category))
          }
        >
          {step < 4 ? "Next" : "Publish"}
        </button>
      </div>
    </div>
  );
};

export default UploadBTS;

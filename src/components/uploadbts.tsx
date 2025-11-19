import { useState } from "react";
import React from "react";
import {
    CloudUpload,

} from "lucide-react";
import "./uploadbts.css";

const UploadBTS: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="upload-container">
      {/* Progress Bar */}
      <div className="upload-steps">
        <div className="step completed">1<br/><span>Upload File</span></div>
        <div className="step">2<br/><span>Content Details</span></div>
        <div className="step">3<br/><span>Pricing & Access</span></div>
        <div className="step">4<br/><span>Review & Publish</span></div>
      </div>

      <h1 className="upload-title">Upload Your BTS Video</h1>
      <p className="upload-subtitle">
        Supported formats: MP4, MOV, AVI • Max size: 5GB • Your file will be securely stored on Walrus
      </p>

      {/* Drag & Drop Area */}
      <div
        className="upload-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CloudUpload size={40} color="#1D4ED8" />
        <p>{file ? file.name : "Drag & drop your video here"}</p>
        <span>or</span>
        <label className="browse-btn">
          Browse Files
          <input type="file" accept="video/*" onChange={handleFileChange} />
        </label>
        <p className="supported-formats">
          Supported formats: MP4, MOV, AVI, MKV, WEBM
        </p>
      </div>
    </div>
  );
};

export default UploadBTS;

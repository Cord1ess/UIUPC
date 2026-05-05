"use client";

import React, { useState, useRef } from 'react';
import { IconCloudUpload, IconSync, IconCheckCircle, IconExclamationTriangle, IconClose } from '@/components/shared/Icons';
import { getImageUrl } from '@/utils/imageUrl';

interface Admin_DriveDropzoneProps {
  onUploadSuccess?: (fileId: string) => void;
  onFileSelect?: (file: File) => void;
  currentFileId?: string;
  action?: string;
  folderName?: string;
  mode?: 'direct' | 'deferred';
}

export const Admin_DriveDropzone: React.FC<Admin_DriveDropzoneProps> = ({ 
  onUploadSuccess,
  onFileSelect,
  currentFileId,
  action = 'upload',
  folderName = 'Root',
  mode = 'direct'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentFileId || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const GAS_URL = process.env.NEXT_PUBLIC_GAS_DRIVE;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file (PNG, JPG, etc)");
      return;
    }

    if (mode === 'deferred') {
      setPreview(URL.createObjectURL(file));
      onFileSelect?.(file);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      if (!GAS_URL) throw new Error("Google Drive API is not configured.");

      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      // Post to GAS
      const response = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: action,
          fileName: `File-${Date.now()}-${file.name}`,
          mimeType: file.type,
          data: base64Data,
          folderName: folderName
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setPreview(result.fileId);
      onUploadSuccess?.(result.fileId);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload to Google Drive");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transaction Receipt (Drive Upload)</label>
      
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative h-48 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden
          ${preview ? 'border-uiupc-orange/50 bg-uiupc-orange/[0.02]' : 'border-black/5 dark:border-white/5 hover:border-uiupc-orange/30 bg-zinc-50 dark:bg-black/40'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[0.99]'}
        `}
      >
        {preview ? (
          <>
            <img src={getImageUrl(preview, 400, 300)} className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" alt="Receipt Preview" />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center text-green-500">
                <IconCheckCircle size={24} />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white block">
                  {mode === 'deferred' ? 'File Selected' : 'Saved to Drive'}
                </span>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setPreview(null); 
                    onUploadSuccess?.(""); 
                    onFileSelect?.(null as any);
                  }}
                  className="mt-2 px-4 py-1.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-red-600 transition-colors"
                >
                  Remove Receipt
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center shadow-lg transition-all ${isUploading ? 'bg-uiupc-orange text-white animate-spin' : 'bg-white dark:bg-zinc-900 text-zinc-400'}`}>
              {isUploading ? <IconSync size={24} /> : <IconCloudUpload size={28} />}
            </div>
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white block">
                {isUploading ? 'Uploading to Google Drive...' : 'Drop Receipt Here'}
              </span>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">or click to browse local files</p>
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-500">
                <IconExclamationTriangle size={12} />
                <span className="text-[8px] font-bold uppercase tracking-widest">{error}</span>
              </div>
            )}
          </>
        )}
      </div>

      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
    </div>
  );
};

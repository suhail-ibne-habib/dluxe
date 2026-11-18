"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon, Check } from 'lucide-react';

export default function ImageUploader({
  value,
  onChange,
  label = "Image",
  description = "Upload from your computer or enter an image URL",
  previewHeight = "h-40"
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState(value || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      onChange(data.url);
      setCustomUrl(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange('');
    setCustomUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    onChange(customUrl);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            {showUrlInput ? 'Hide URL input' : 'Or paste URL'}
          </button>
        </div>
      )}

      {/* URL input field if toggled */}
      {showUrlInput && (
        <div className="flex gap-2 mb-2 animate-in fade-in duration-150">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* If an image exists, show preview */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
          <div className={`${previewHeight} w-full relative overflow-hidden flex items-center justify-center bg-gray-900/5`}>
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=800&auto=format&fit=crop';
              }}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                <span className="text-xs font-bold">Uploading new image...</span>
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-white/95 text-gray-700 hover:text-orange-600 hover:bg-white rounded-lg shadow-sm text-xs font-bold flex items-center gap-1 backdrop-blur-sm"
              title="Change Image"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 bg-red-600/90 text-white hover:bg-red-700 rounded-lg shadow-sm"
              title="Remove Image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span className="truncate max-w-[260px] font-mono text-gray-600">{value}</span>
            <span className="text-green-600 font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready
            </span>
          </div>
        </div>
      ) : (
        /* Empty state: Dropzone / click to upload */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-50/50 scale-[0.99]'
              : 'border-gray-200 bg-gray-50/50 hover:bg-orange-50/20 hover:border-orange-300'
          }`}
        >
          {isUploading ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              <p className="text-xs font-bold text-gray-700">Uploading image directly from your computer...</p>
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800">
                Click to upload from computer <span className="text-gray-400 font-normal">or drag & drop</span>
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, WebP, GIF, SVG (up to 15MB)
              </p>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
          {uploadError}
        </p>
      )}
    </div>
  );
}

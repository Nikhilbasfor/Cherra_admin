"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  X,
  UploadCloud,
  FolderUp,
  Image as ImageIcon,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Hotel } from "@/lib/types";
import { uploadAdminHotelImages, saveAdminHotel } from "@/lib/api";

interface HotelPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel | null;
  onSaved: (updatedHotel: Hotel) => void;
}

export default function HotelPhotosModal({
  isOpen,
  onClose,
  hotel,
  onSaved,
}: HotelPhotosModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [replaceAll, setReplaceAll] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hotel) {
      setCurrentImages(hotel.images || []);
      setSelectedFiles([]);
      setPreviews([]);
      setErrorMsg("");
      setSuccessMsg("");
      setUploadProgress(null);
      setReplaceAll(true);
    }
  }, [hotel, isOpen]);

  // Clean up object URLs on unmount/change
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  if (!isOpen || !hotel) return null;

  const hasUnsplash = currentImages.some((img) => img.includes("unsplash.com"));

  const handleFilesSelected = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMsg("");
    setSuccessMsg("");

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    Array.from(filesList).forEach((file) => {
      if (
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|avif|heic)$/i.test(file.name)
      ) {
        validFiles.push(file);
        validPreviews.push(URL.createObjectURL(file));
      }
    });

    if (validFiles.length === 0) {
      setErrorMsg("No supported image files found in the selected folder/files.");
      return;
    }

    setSelectedFiles(validFiles);
    setPreviews(validPreviews);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleDeleteExistingImage = async (indexToDelete: number) => {
    if (currentImages.length <= 1) {
      setErrorMsg("A hotel must have at least one photo. Upload new photos before deleting the last one.");
      return;
    }
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToDelete);
    setCurrentImages(updatedImages);
    try {
      const updatedHotel: Hotel = { ...hotel, images: updatedImages };
      await saveAdminHotel(updatedHotel);
      onSaved(updatedHotel);
      setSuccessMsg("Photo removed successfully.");
    } catch {
      setErrorMsg("Failed to delete photo. Please try again.");
    }
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg("Please select images or a folder to upload.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setUploadProgress({ current: 0, total: selectedFiles.length });

    try {
      const result = await uploadAdminHotelImages(
        hotel,
        selectedFiles,
        replaceAll,
        (current, total) => {
          setUploadProgress({ current, total });
        }
      );

      if (result.success && result.hotel) {
        setCurrentImages(result.hotel.images || result.images);
        onSaved(result.hotel);
        setSuccessMsg(`Successfully uploaded ${selectedFiles.length} photos! Old images replaced.`);
        setSelectedFiles([]);
        setPreviews([]);
        setTimeout(() => {
          setSuccessMsg("");
        }, 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload photos";
      setErrorMsg(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <ImageIcon className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Manage Photos: {hotel.name}
              </h2>
              <p className="text-xs text-slate-500">
                Upload a folder or select photos to replace default/Unsplash images
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Unsplash Alert */}
          {hasUnsplash && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-[11px]">Using Unsplash Placeholder Images</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  This hotel is currently showing generic Unsplash demo photos. Select your real property photo folder below and click <strong>Upload & Replace</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Current Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 text-xs">
                Current Active Photos ({currentImages.length})
              </h3>
              <span className="text-[10px] text-slate-400">First photo is used as main thumbnail</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {currentImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200 shadow-2xs"
                >
                  <Image
                    src={imgUrl}
                    alt={`Hotel photo ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 16vw"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[8px] font-black uppercase tracking-wider shadow-xs">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(idx)}
                    disabled={isUploading}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove this photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Upload Area */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>Select New Hotel Photos (Folder or Multi-Select)</span>
            </h3>

            {/* Hidden Inputs */}
            <input
              ref={folderInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is standard in modern browsers
              webkitdirectory=""
              directory=""
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <input
              ref={filesInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />

            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <FolderUp className="w-6 h-6" />
              </div>

              <div>
                <p className="font-bold text-slate-800 text-xs sm:text-sm">
                  Drag & Drop a Folder or Photos Here
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports JPG, PNG, WEBP, AVIF directly from your PC
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>Select Entire Folder</span>
                </button>

                <button
                  type="button"
                  onClick={() => filesInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-slate-600" />
                  <span>Pick Image Files</span>
                </button>
              </div>
            </div>

            {/* Replace Options */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="replacePhotosToggle"
                checked={replaceAll}
                onChange={(e) => setReplaceAll(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <label
                htmlFor="replacePhotosToggle"
                className="text-xs text-slate-700 font-medium cursor-pointer"
              >
                Replace all current photos (recommended: cleans out hardcoded Unsplash images)
              </label>
            </div>

            {/* Selected Previews */}
            {selectedFiles.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedFiles.length} photos ready for upload</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFiles([]);
                      setPreviews([]);
                    }}
                    className="text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    Clear Selection
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {previews.slice(0, 16).map((previewUrl, pIdx) => (
                    <div
                      key={pIdx}
                      className="relative rounded-lg overflow-hidden aspect-square bg-slate-200 border border-slate-300 shadow-2xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt={`Preview ${pIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {previews.length > 16 && (
                    <div className="rounded-lg aspect-square bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
                      +{previews.length - 16}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isUploading && uploadProgress && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Uploading photo {uploadProgress.current} of {uploadProgress.total}...</span>
                  </span>
                  <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Error & Success Feedback */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-bold text-xs transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleStartUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              isUploading || selectedFiles.length === 0
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-emerald-900/20"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>
                  {selectedFiles.length > 0
                    ? `Upload & Replace (${selectedFiles.length} Photos)`
                    : "Upload Photos"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

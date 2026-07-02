"use client";

import { useState, useRef } from "react";
import { Stamp, ArrowLeft, Type, ImageIcon, Upload, X } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { addWatermark, addImageWatermark, downloadBlob } from "@/lib/pdf-utils";

type WatermarkMode = "text" | "image";
type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export default function WatermarkPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Mode
  const [mode, setMode] = useState<WatermarkMode>("text");

  // Text watermark settings
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(50);
  const [textOpacity, setTextOpacity] = useState(0.3);
  const [textRotation, setTextRotation] = useState(-45);

  // Image watermark settings
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(0.3);
  const [imageOpacity, setImageOpacity] = useState(0.3);
  const [imageRotation, setImageRotation] = useState(0);
  const [imagePosition, setImagePosition] = useState<Position>("center");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsComplete(false);
  };

  const handleRemoveFile = () => {
    setFiles([]);
    setIsComplete(false);
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWatermarkImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setIsComplete(false);
    }
  };

  const removeWatermarkImage = () => {
    setWatermarkImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleWatermark = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      let result: Uint8Array;

      if (mode === "text") {
        if (!watermarkText.trim()) return;
        result = await addWatermark(files[0], watermarkText, {
          fontSize,
          opacity: textOpacity,
          rotation: textRotation,
        });
      } else {
        if (!watermarkImage) return;
        result = await addImageWatermark(files[0], watermarkImage, {
          scale: imageScale,
          opacity: imageOpacity,
          rotation: imageRotation,
          position: imagePosition,
        });
      }

      downloadBlob(result, `watermarked-${files[0].name}`);
      setIsComplete(true);
    } catch (error) {
      console.error("Error adding watermark:", error);
      alert(
        "Error adding watermark. Please make sure the file is a valid PDF."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const positions: { value: Position; label: string }[] = [
    { value: "center", label: "Center" },
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  const isActionDisabled =
    mode === "text" ? !watermarkText.trim() : !watermarkImage;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Stamp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Watermark PDF</h1>
            <p className="text-[var(--muted-foreground)]">
              Add text or image watermarks to your PDF pages
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <FileDropZone
        onFilesSelected={handleFilesSelected}
        accept=".pdf"
        multiple={false}
        maxFiles={1}
        files={files}
        onRemoveFile={handleRemoveFile}
      />

      {/* Watermark Options */}
      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode("text");
                setIsComplete(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === "text"
                  ? "bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/20"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              <Type className="w-4 h-4" />
              Text Watermark
            </button>
            <button
              onClick={() => {
                setMode("image");
                setIsComplete(false);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === "image"
                  ? "bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/20"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Image Watermark
            </button>
          </div>

          {/* Text Watermark Settings */}
          {mode === "text" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => {
                    setWatermarkText(e.target.value);
                    setIsComplete(false);
                  }}
                  placeholder="Enter watermark text"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>20px</span>
                  <span>120px</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Opacity: {Math.round(textOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={textOpacity}
                  onChange={(e) => setTextOpacity(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>Transparent</span>
                  <span>Opaque</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rotation: {textRotation}°
                </label>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={textRotation}
                  onChange={(e) => setTextRotation(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>-90°</span>
                  <span>0°</span>
                  <span>90°</span>
                </div>
              </div>

              {/* Text Preview */}
              <div className="p-8 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center min-h-[120px]">
                <span
                  style={{
                    fontSize: `${Math.min(fontSize, 32)}px`,
                    opacity: textOpacity,
                    transform: `rotate(${textRotation}deg)`,
                    color: "var(--muted-foreground)",
                    fontWeight: "bold",
                  }}
                >
                  {watermarkText || "Preview"}
                </span>
              </div>
            </div>
          )}

          {/* Image Watermark Settings */}
          {mode === "image" && (
            <div className="space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Watermark Image
                </label>
                {watermarkImage ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    {imagePreviewUrl && (
                      <img
                        src={imagePreviewUrl}
                        alt="Watermark preview"
                        className="w-12 h-12 object-contain rounded-lg bg-[var(--muted)]"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {watermarkImage.name}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {(watermarkImage.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={removeWatermarkImage}
                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-[var(--muted-foreground)] hover:text-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all"
                  >
                    <Upload className="w-5 h-5 text-[var(--muted-foreground)]" />
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Choose a PNG or JPG image
                    </span>
                  </button>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageSelected}
                  className="hidden"
                />
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Size: {Math.round(imageScale * 100)}% of page width
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={imageScale}
                  onChange={(e) => setImageScale(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>5%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Opacity: {Math.round(imageOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={imageOpacity}
                  onChange={(e) => setImageOpacity(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>Transparent</span>
                  <span>Opaque</span>
                </div>
              </div>

              {/* Rotation */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rotation: {imageRotation}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={imageRotation}
                  onChange={(e) => setImageRotation(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                  <span>-180°</span>
                  <span>0°</span>
                  <span>180°</span>
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Position
                </label>
                <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                  {/* Top row */}
                  <button
                    onClick={() => setImagePosition("top-left")}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${
                      imagePosition === "top-left"
                        ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/30 text-[var(--primary)]"
                        : "border-[var(--border)] hover:border-[var(--primary)]"
                    }`}
                  >
                    TL
                  </button>
                  <div className="aspect-square" />
                  <button
                    onClick={() => setImagePosition("top-right")}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${
                      imagePosition === "top-right"
                        ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/30 text-[var(--primary)]"
                        : "border-[var(--border)] hover:border-[var(--primary)]"
                    }`}
                  >
                    TR
                  </button>
                  {/* Middle row */}
                  <div className="aspect-square" />
                  <button
                    onClick={() => setImagePosition("center")}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${
                      imagePosition === "center"
                        ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/30 text-[var(--primary)]"
                        : "border-[var(--border)] hover:border-[var(--primary)]"
                    }`}
                  >
                    C
                  </button>
                  <div className="aspect-square" />
                  {/* Bottom row */}
                  <button
                    onClick={() => setImagePosition("bottom-left")}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${
                      imagePosition === "bottom-left"
                        ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/30 text-[var(--primary)]"
                        : "border-[var(--border)] hover:border-[var(--primary)]"
                    }`}
                  >
                    BL
                  </button>
                  <div className="aspect-square" />
                  <button
                    onClick={() => setImagePosition("bottom-right")}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-medium transition-all ${
                      imagePosition === "bottom-right"
                        ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/30 text-[var(--primary)]"
                        : "border-[var(--border)] hover:border-[var(--primary)]"
                    }`}
                  >
                    BR
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreviewUrl && (
                <div className="p-6 rounded-xl bg-[var(--muted)] border border-[var(--border)] flex items-center justify-center min-h-[160px] relative overflow-hidden">
                  <div
                    className="border border-dashed border-[var(--border)] bg-white dark:bg-gray-800 relative"
                    style={{ width: "200px", height: "260px" }}
                  >
                    <img
                      src={imagePreviewUrl}
                      alt="Watermark preview"
                      style={{
                        position: "absolute",
                        opacity: imageOpacity,
                        transform: `rotate(${imageRotation}deg)`,
                        width: `${imageScale * 100}%`,
                        ...(imagePosition === "center" && {
                          top: "50%",
                          left: "50%",
                          transform: `translate(-50%, -50%) rotate(${imageRotation}deg)`,
                        }),
                        ...(imagePosition === "top-left" && {
                          top: "8px",
                          left: "8px",
                        }),
                        ...(imagePosition === "top-right" && {
                          top: "8px",
                          right: "8px",
                        }),
                        ...(imagePosition === "bottom-left" && {
                          bottom: "8px",
                          left: "8px",
                        }),
                        ...(imagePosition === "bottom-right" && {
                          bottom: "8px",
                          right: "8px",
                        }),
                      }}
                    />
                    <span className="absolute top-1 left-1 text-[8px] text-[var(--muted-foreground)]">
                      PDF Page
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action */}
      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton
            onClick={handleWatermark}
            isProcessing={isProcessing}
            isComplete={isComplete}
            label="Add Watermark & Download"
            disabled={isActionDisabled}
          />
        </div>
      )}
    </div>
  );
}

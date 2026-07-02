"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileText, X, GripVertical } from "lucide-react";

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  files: File[];
  onRemoveFile?: (index: number) => void;
  onReorderFiles?: (files: File[]) => void;
}

export default function FileDropZone({
  onFilesSelected,
  accept = ".pdf",
  multiple = true,
  maxFiles = 50,
  files,
  onRemoveFile,
  onReorderFiles,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).slice(
        0,
        maxFiles - files.length
      );
      if (droppedFiles.length > 0) {
        onFilesSelected(droppedFiles);
      }
    },
    [files.length, maxFiles, onFilesSelected]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []).slice(
        0,
        maxFiles - files.length
      );
      if (selectedFiles.length > 0) {
        onFilesSelected(selectedFiles);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [files.length, maxFiles, onFilesSelected]
  );

  const handleFileDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleFileDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const [removed] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, removed);
    onReorderFiles?.(newFiles);
    setDraggedIndex(index);
  };

  const handleFileDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20 drop-zone-active"
            : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging
                ? "bg-indigo-100 dark:bg-indigo-900/50"
                : "bg-[var(--muted)]"
            }`}
          >
            <Upload
              className={`w-8 h-8 ${
                isDragging
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]"
              }`}
            />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {isDragging ? "Drop files here" : "Drop files here or click to browse"}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {accept === ".pdf"
                ? "PDF files supported"
                : accept === "image/*"
                ? "JPG, PNG, WebP images supported"
                : `Supported: ${accept}`}
              {multiple && ` • Up to ${maxFiles} files`}
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </p>
            {files.length > 1 && onReorderFiles && (
              <p className="text-xs text-[var(--muted-foreground)]">
                Drag to reorder
              </p>
            )}
          </div>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              draggable={!!onReorderFiles}
              onDragStart={() => handleFileDragStart(index)}
              onDragOver={(e) => handleFileDragOver(e, index)}
              onDragEnd={handleFileDragEnd}
              className={`flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all ${
                draggedIndex === index ? "opacity-50 scale-95" : ""
              } ${onReorderFiles ? "cursor-grab active:cursor-grabbing" : ""}`}
            >
              {onReorderFiles && (
                <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
              )}
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {formatSize(file.size)}
                </p>
              </div>
              {onRemoveFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-[var(--muted-foreground)] hover:text-red-600 transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

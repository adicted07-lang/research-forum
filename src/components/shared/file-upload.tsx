"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  onChange: (url: string) => void;
}

export function FileUpload({
  accept = "image/jpeg,image/png,image/gif,image/webp,application/pdf",
  maxSize = 10 * 1024 * 1024,
  onChange,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate size
      if (file.size > maxSize) {
        setError(`File exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      // Validate type
      const accepted = accept.split(",").map((t) => t.trim());
      if (!accepted.includes(file.type)) {
        setError("File type not allowed");
        return;
      }

      // Show image preview
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      setIsUploading(true);
      setProgress(10);

      try {
        const formData = new FormData();
        formData.append("file", file);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((p) => Math.min(p + 20, 80));
        }, 200);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Upload failed");
        }

        setUploadedUrl(data.url);
        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setPreview(null);
      } finally {
        setIsUploading(false);
        setTimeout(() => setProgress(0), 500);
      }
    },
    [accept, maxSize, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = () => {
    setPreview(null);
    setUploadedUrl(null);
    setError(null);
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {!uploadedUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-surface dark:border-border-dark dark:hover:border-primary/50 dark:hover:bg-surface-dark"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                Uploading...
              </p>
              {progress > 0 && (
                <div className="w-full max-w-xs h-1.5 bg-border rounded-full overflow-hidden dark:bg-border-dark">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-text-tertiary dark:text-text-dark-tertiary" />
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  Drag and drop or{" "}
                  <span className="text-primary">click to browse</span>
                </p>
                <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary mt-1">
                  Max {Math.round(maxSize / 1024 / 1024)}MB
                </p>
              </div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative rounded-md border border-border dark:border-border-dark overflow-hidden">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Upload preview"
              className="w-full max-h-48 object-contain bg-surface dark:bg-surface-dark"
            />
          ) : (
            <div className="flex items-center gap-3 p-4 bg-surface dark:bg-surface-dark">
              <FileText className="w-6 h-6 text-primary shrink-0" />
              <span className="text-sm text-text-secondary dark:text-text-dark-secondary truncate">
                {uploadedUrl}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-white/90 dark:bg-surface-dark/90 border border-border dark:border-border-dark rounded-full hover:bg-error/10 hover:border-error/30 transition-colors"
            title="Remove file"
          >
            <X className="w-3.5 h-3.5 text-text-secondary dark:text-text-dark-secondary" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}
    </div>
  );
}

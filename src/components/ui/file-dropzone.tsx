"use client";

import { useCallback, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * ドラッグ＆ドロップ対応のファイルアップロードコンポーネント
 * クリックでのファイル選択とドラッグ＆ドロップの両方に対応
 */
export function FileDropzone({
  onFileSelect,
  accept = "image/*,.pdf",
  maxSize = 10 * 1024 * 1024, // デフォルト10MB
  disabled = false,
  className,
  children,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      // ファイルサイズチェック
      if (file.size > maxSize) {
        setError(`ファイルサイズが大きすぎます（最大${Math.round(maxSize / 1024 / 1024)}MB）`);
        return false;
      }

      // ファイルタイプチェック
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.replace("/*", "/"));
        }
        return file.type === type;
      });

      if (!isAccepted) {
        setError("このファイル形式には対応していません");
        return false;
      }

      return true;
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // 同じファイルを再選択できるようにリセット
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {children || (
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <div className="text-gray-600">
              <span className="font-medium text-blue-600">クリックして選択</span>
              <span className="mx-2">または</span>
              <span className="font-medium">ドラッグ＆ドロップ</span>
            </div>
            <p className="text-sm text-gray-500">
              PNG, JPG, PDF に対応（最大{Math.round(maxSize / 1024 / 1024)}MB）
            </p>
          </div>
        )}

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 rounded-lg">
            <div className="text-blue-600 font-medium">
              ここにドロップしてアップロード
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}

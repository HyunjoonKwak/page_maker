'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function ImageUpload({
  onUpload,
  maxFiles = 5,
  disabled = false,
}: ImageUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const validFiles = Array.from(newFiles)
        .filter((file) => file.type.startsWith('image/'))
        .slice(0, maxFiles - files.length);

      if (validFiles.length === 0) return;

      // 미리보기 생성
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

      setFiles((prev) => [...prev, ...validFiles].slice(0, maxFiles));
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, maxFiles));
    },
    [files.length, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleRemove = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="space-y-4">
      {/* 드롭존 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled || files.length >= maxFiles}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <p className="text-sm font-medium text-gray-700">
          이미지를 드래그하거나 클릭하여 업로드
        </p>
        <p className="mt-1 text-xs text-gray-500">
          최대 {maxFiles}개 · PNG, JPG, WEBP
        </p>
      </div>

      {/* 미리보기 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {previews.map((preview, index) => (
            <div
              key={preview}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* 추가 슬롯 */}
          {files.length < maxFiles && (
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-100">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <ImageIcon className="h-8 w-8" />
            </label>
          )}
        </div>
      )}

      {/* 완료 버튼 */}
      {files.length > 0 && (
        <Button
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full rounded-full bg-blue-500 hover:bg-blue-600"
        >
          <Check className="mr-2 h-4 w-4" />
          {files.length}개 이미지 선택 완료
        </Button>
      )}
    </div>
  );
}

import { useRef, useState } from 'react';

interface CoverPhotoUploaderProps {
  value: File | null;
  preview: string | null;
  onChange: (file: File, preview: string) => void;
  onRemove: () => void;
}

export default function CoverPhotoUploader({ value, preview, onChange, onRemove }: CoverPhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onChange(file, url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="block font-mono-brand text-label-tag text-on-surface-variant mb-2">
        COVER PHOTO
      </label>

      {preview ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-outline-variant group">
          <img src={preview} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-on-surface font-mono-brand text-label-tag px-3 py-2 rounded-lg btn-extruded"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="bg-tertiary text-on-tertiary font-mono-brand text-label-tag px-3 py-2 rounded-lg btn-extruded"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragging
              ? 'border-primary bg-primary-fixed/20'
              : 'border-outline-variant bg-surface-container-low hover:border-primary hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">
            add_photo_alternate
          </span>
          <p className="font-mono-brand text-label-tag text-on-surface-variant">
            DRAG & DROP OR CLICK TO UPLOAD
          </p>
          <p className="font-jakarta text-sm text-on-surface-variant mt-1">
            JPG, PNG, WEBP up to 10MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

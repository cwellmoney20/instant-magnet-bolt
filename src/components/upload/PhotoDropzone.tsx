import { useRef } from 'react';
import ExtrudedButton from '../ui/ExtrudedButton';

interface PhotoDropzoneProps {
  onFileSelected: (file: File) => void;
}

export default function PhotoDropzone({ onFileSelected }: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    onFileSelected(file);
  }

  return (
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-full aspect-square max-w-xs mx-auto rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low hover:border-primary hover:bg-surface-container transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 p-8"
      >
        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">
            add_a_photo
          </span>
        </div>
        <div className="text-center">
          <p className="font-mono-brand text-label-tag text-on-surface mb-1">
            TAP TO CHOOSE PHOTO
          </p>
          <p className="font-jakarta text-sm text-on-surface-variant">
            Pick from your camera roll or take a new photo
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <ExtrudedButton
          variant="primary"
          size="lg"
          onClick={() => inputRef.current?.click()}
          className="w-full justify-center"
          icon={<span className="material-symbols-outlined">photo_library</span>}
        >
          Choose from Camera Roll
        </ExtrudedButton>

        <ExtrudedButton
          variant="secondary"
          size="lg"
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.capture = 'environment';
              inputRef.current.click();
            }
          }}
          className="w-full justify-center"
          icon={<span className="material-symbols-outlined">photo_camera</span>}
        >
          Take a Photo
        </ExtrudedButton>
      </div>

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

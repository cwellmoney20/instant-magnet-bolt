import { useState, useCallback, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import ExtrudedButton from '../ui/ExtrudedButton';

interface CropToolProps {
  imageUrl: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  uploading?: boolean;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, 1, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function CropTool({ imageUrl, onCropComplete, onCancel, uploading }: CropToolProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setCrop(centerAspectCrop(naturalWidth, naturalHeight));
  }, []);

  async function handleConfirm() {
    if (!imgRef.current || !crop) return;

    const canvas = document.createElement('canvas');
    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const pixelCrop = {
      x: (crop.x / 100) * img.width * scaleX,
      y: (crop.y / 100) * img.height * scaleY,
      width: (crop.width / 100) * img.width * scaleX,
      height: (crop.height / 100) * img.height * scaleY,
    };

    const size = Math.min(pixelCrop.width, pixelCrop.height);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, pixelCrop.x, pixelCrop.y, size, size, 0, 0, size, size);

    canvas.toBlob(
      (blob) => { if (blob) onCropComplete(blob); },
      'image/jpeg',
      0.92
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono-brand text-label-tag text-on-surface-variant mb-1">CROP YOUR PHOTO</p>
        <p className="font-jakarta text-sm text-on-surface-variant">
          Drag to adjust the square crop area for your magnet.
        </p>
      </div>

      <div className="flex justify-center">
        <ReactCrop
          crop={crop}
          onChange={(_, pct) => setCrop(pct)}
          aspect={1}
          circularCrop={false}
          className="max-w-full max-h-[60vh] rounded-xl overflow-hidden"
        >
          <img
            ref={imgRef}
            src={imageUrl}
            onLoad={onImageLoad}
            alt="Crop preview"
            className="max-w-full max-h-[60vh] object-contain"
          />
        </ReactCrop>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 font-mono-brand text-label-tag text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container transition-colors"
        >
          BACK
        </button>
        <ExtrudedButton
          variant="primary"
          size="lg"
          onClick={handleConfirm}
          disabled={uploading || !crop}
          className="flex-1 justify-center"
          icon={uploading
            ? <span className="material-symbols-outlined text-base animate-spin">sync</span>
            : <span className="material-symbols-outlined text-base">check_circle</span>
          }
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </ExtrudedButton>
      </div>
    </div>
  );
}

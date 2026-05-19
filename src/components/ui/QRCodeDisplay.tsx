import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  caption?: string;
}

export default function QRCodeDisplay({ value, size = 128, caption }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-3 rounded-lg shadow-sm border border-outline-variant">
        <QRCodeSVG
          value={value}
          size={size}
          bgColor="#ffffff"
          fgColor="#1a1c1b"
          level="M"
        />
      </div>
      {caption && (
        <p className="font-mono-brand text-label-tag text-on-surface-variant text-center">
          {caption}
        </p>
      )}
    </div>
  );
}

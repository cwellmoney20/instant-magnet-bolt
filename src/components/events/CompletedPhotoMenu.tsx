import { useState, useRef, useEffect } from 'react';

interface CompletedPhotoMenuProps {
  photoId: string;
  onReprint: (photoId: string) => void;
  onResendNotification: (photoId: string) => void;
}

export default function CompletedPhotoMenu({
  photoId,
  onReprint,
  onResendNotification,
}: CompletedPhotoMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-colors shadow-sm"
        aria-label="Photo actions"
      >
        <span className="material-symbols-outlined text-sm" style={{ fontSize: '16px' }}>
          more_vert
        </span>
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-1.5 w-48 bg-surface-container-lowest rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.18)] border border-outline-variant overflow-hidden z-40">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReprint(photoId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-container transition-colors group"
          >
            <span className="material-symbols-outlined text-sm text-secondary group-hover:text-secondary">
              print
            </span>
            <span className="font-jakarta text-sm text-on-surface">Reprint</span>
          </button>
          <div className="h-px bg-outline-variant mx-2" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onResendNotification(photoId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-container transition-colors group"
          >
            <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-on-surface">
              notifications
            </span>
            <span className="font-jakarta text-sm text-on-surface">Resend Notification</span>
          </button>
        </div>
      )}
    </div>
  );
}

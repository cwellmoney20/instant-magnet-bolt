import { useState } from 'react';
import type { Photo, PhotoStatus } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface BatchConfirmModalProps {
  photos: Photo[];
  targetStatus: PhotoStatus;
  targetLabel: string;
  onConfirm: (ids: string[]) => void;
  onCancel: () => void;
}

function getImageUrl(storagePath: string) {
  return supabase.storage.from('event-photos').getPublicUrl(storagePath).data.publicUrl;
}

export default function BatchConfirmModal({
  photos,
  targetStatus,
  targetLabel,
  onConfirm,
  onCancel,
}: BatchConfirmModalProps) {
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const remaining = photos.filter((p) => !excluded.has(p.id));
  const isForward = targetStatus !== 'new';

  function toggleExclude(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-on-surface/60 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.3)] border border-outline-variant w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant flex-shrink-0">
          <div>
            <p className="font-mono-brand text-label-tag text-on-surface-variant mb-1">
              BATCH MOVE
            </p>
            <h2 className="font-jakarta font-bold text-xl text-on-surface">
              {targetLabel}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="px-5 py-3 bg-surface-container border-b border-outline-variant flex-shrink-0">
          <p className="font-jakarta text-sm text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">info</span>
            Click the X on any photo to remove it from this batch before confirming.
          </p>
        </div>

        {/* Photo grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {remaining.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">
                photo_library
              </span>
              <p className="font-jakarta text-sm text-on-surface-variant">
                All photos removed from batch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {photos.map((photo) => {
                const isExcluded = excluded.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                      isExcluded
                        ? 'opacity-30 border-outline-variant scale-95'
                        : 'border-transparent hover:border-outline-variant'
                    }`}
                  >
                    <img
                      src={getImageUrl(photo.storage_path)}
                      alt={photo.event_guests?.name ?? 'Photo'}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                    <button
                      onClick={() => toggleExclude(photo.id)}
                      className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-md ${
                        isExcluded
                          ? 'bg-surface-container text-on-surface-variant opacity-100'
                          : 'bg-on-surface text-inverse-on-surface opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label={isExcluded ? 'Re-include photo' : 'Remove photo from batch'}
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontSize: '14px' }}>
                        {isExcluded ? 'add' : 'close'}
                      </span>
                    </button>
                    {photo.event_guests?.name && (
                      <div className="absolute bottom-0 inset-x-0 bg-on-surface/70 px-1.5 py-0.5">
                        <p className="font-mono-brand text-[9px] text-inverse-on-surface truncate">
                          {photo.event_guests.name}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline-variant flex items-center justify-between gap-3 flex-shrink-0 bg-surface-container-low">
          <p className="font-jakarta text-sm text-on-surface-variant">
            {remaining.length === 0
              ? 'No photos to move'
              : `Moving ${remaining.length} of ${photos.length} photo${photos.length !== 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="font-mono-brand text-label-tag text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-lg hover:bg-surface-container transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={() => onConfirm(remaining.map((p) => p.id))}
              disabled={remaining.length === 0}
              className="font-mono-brand text-label-tag bg-primary text-on-primary px-4 py-2 rounded-lg btn-extruded hover:bg-primary-fixed-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">
                {isForward ? 'arrow_forward' : 'arrow_back'}
              </span>
              CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

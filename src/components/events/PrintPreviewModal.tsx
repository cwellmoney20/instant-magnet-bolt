import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import type { Photo } from '../../types/database';
import { supabase } from '../../lib/supabase';

const PHOTOS_PER_PAGE = 6;

type PrintState = 'idle' | 'processing' | 'success';

interface PrintPreviewModalProps {
  photos: Photo[];
  onConfirmPrint: (ids: string[], photosToRender: Photo[]) => void;
  onSkipPrint: (ids: string[]) => void;
  onCancel: () => void;
  onPrintComplete?: (ids: string[]) => void;
}

function getImageUrl(storagePath: string) {
  return supabase.storage.from('event-photos').getPublicUrl(storagePath).data.publicUrl;
}

export default function PrintPreviewModal({
  photos,
  onConfirmPrint,
  onSkipPrint,
  onCancel,
  onPrintComplete,
}: PrintPreviewModalProps) {
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [printState, setPrintState] = useState<PrintState>('idle');
  const [printedIds, setPrintedIds] = useState<string[]>([]);

  const included = photos.filter((p) => !excluded.has(p.id));
  const totalPages = Math.max(1, Math.ceil(included.length / PHOTOS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const pagePhotos = included.slice(safePage * PHOTOS_PER_PAGE, (safePage + 1) * PHOTOS_PER_PAGE);

  function toggleExclude(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (pagePhotos.length === 1 && safePage > 0) {
      setCurrentPage(safePage - 1);
    }
  }

  const includedIds = included.map((p) => p.id);

  async function handlePrint() {
    if (printState !== 'idle' || included.length === 0) return;

    setPrintState('processing');

    // Simulate processing delay (2–3 seconds)
    const delay = 2000 + Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Mark as printed in the parent
    onConfirmPrint(includedIds, included);
    setPrintedIds(includedIds);
    setPrintState('success');

    // Auto-close after success is shown
    setTimeout(() => {
      onPrintComplete?.(includedIds);
      onCancel();
    }, 1000);
  }

  function handleClose() {
    if (printState === 'success') {
      onPrintComplete?.(printedIds);
    }
    onCancel();
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  const isPrinting = printState === 'processing';
  const isSuccess = printState === 'success';
  const isDisabled = printState !== 'idle' || included.length === 0;

  return (
    <>
      {/* Screen modal UI */}
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-on-surface/60 backdrop-blur-sm no-print"
        onClick={handleOverlayClick}
      >
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.3)] border border-outline-variant w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant flex-shrink-0">
            <div>
              <p className="font-mono-brand text-label-tag text-on-surface-variant mb-1">
                PRINT PREVIEW
              </p>
              <h2 className="font-jakarta font-bold text-xl text-on-surface">
                Review Before Printing
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Info banner */}
          <div className="px-5 py-3 bg-surface-container border-b border-outline-variant flex-shrink-0 flex items-center justify-between gap-3">
            <p className="font-jakarta text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">print</span>
              Up to {PHOTOS_PER_PAGE} photos per page. Click X to remove a photo from the print job.
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <span className="font-mono-brand text-label-tag text-on-surface-variant whitespace-nowrap">
                  PAGE {safePage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage === totalPages - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors disabled:opacity-30"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            )}
          </div>

          {/* Photo grid preview */}
          <div className="flex-1 overflow-y-auto p-5">
            {included.length === 0 ? (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3 block">
                  photo_library
                </span>
                <p className="font-jakarta text-sm text-on-surface-variant">
                  All photos removed from print job.
                </p>
              </div>
            ) : (
              <>
                {/* 3x3 preview grid */}
                <div className="grid grid-cols-3 gap-3">
                  {pagePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-outline-variant transition-all"
                    >
                      {/* Polaroid-style preview */}
                      <div className="bg-white p-1.5 pb-6 shadow-sm">
                        <img
                          src={getImageUrl(photo.storage_path)}
                          alt={photo.event_guests?.name ?? 'Photo'}
                          className="w-full aspect-square object-cover"
                          loading="lazy"
                        />
                        <p className="font-mono-brand text-[8px] text-center text-on-surface-variant mt-1 truncate px-1">
                          {photo.event_guests?.name ?? ''}
                        </p>
                      </div>

                      {/* Remove button — hidden once printing started */}
                      {printState === 'idle' && (
                        <button
                          onClick={() => toggleExclude(photo.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-on-surface text-inverse-on-surface flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          aria-label="Remove from print job"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Empty cell placeholders to maintain grid shape */}
                  {pagePhotos.length < PHOTOS_PER_PAGE &&
                    Array.from({ length: PHOTOS_PER_PAGE - pagePhotos.length }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="aspect-square rounded-lg border-2 border-dashed border-outline-variant/40 bg-surface-container/30"
                      />
                    ))}
                </div>

                {/* Excluded photos strip */}
                {excluded.size > 0 && printState === 'idle' && (
                  <div className="mt-4 pt-4 border-t border-outline-variant">
                    <p className="font-mono-brand text-label-tag text-on-surface-variant mb-3">
                      EXCLUDED ({excluded.size})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {photos.filter((p) => excluded.has(p.id)).map((photo) => (
                        <button
                          key={photo.id}
                          onClick={() => toggleExclude(photo.id)}
                          className="relative w-14 h-14 rounded overflow-hidden border-2 border-outline-variant hover:border-secondary transition-colors group"
                          aria-label="Re-add to print job"
                          title="Click to re-add"
                        >
                          <img
                            src={getImageUrl(photo.storage_path)}
                            alt=""
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface text-sm">add</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success message overlay */}
                {isSuccess && (
                  <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="font-jakarta text-sm text-green-800">
                      {printedIds.length} photo{printedIds.length !== 1 ? 's' : ''} marked as printed. Close this window to view them in the Printed tab.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-outline-variant flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0 bg-surface-container-low">
            <div className="flex items-center gap-3">
              <p className="font-jakarta text-sm text-on-surface-variant">
                {included.length === 0
                  ? 'No photos to print'
                  : `${included.length} photo${included.length !== 1 ? 's' : ''} • ${totalPages} page${totalPages !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {printState === 'idle' && (
                <>
                  <button
                    onClick={handleClose}
                    className="font-mono-brand text-label-tag text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-lg hover:bg-surface-container transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => onSkipPrint(includedIds)}
                    disabled={included.length === 0}
                    className="font-mono-brand text-label-tag bg-surface-container-high text-on-surface px-4 py-2 rounded-lg btn-extruded hover:bg-surface-container-highest transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">skip_next</span>
                    SKIP PRINT
                  </button>
                </>
              )}

              <button
                onClick={handlePrint}
                disabled={isDisabled}
                className={`font-mono-brand text-label-tag px-5 py-2 rounded-lg btn-extruded transition-colors flex items-center gap-2 min-w-[120px] justify-center ${
                  isSuccess
                    ? 'bg-green-600 text-white cursor-default'
                    : isPrinting
                    ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                    : included.length === 0
                    ? 'bg-primary text-on-primary opacity-40 cursor-not-allowed'
                    : 'bg-primary text-on-primary hover:bg-primary-fixed-dim'
                }`}
              >
                {isPrinting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isSuccess && (
                  <CheckCircle className="w-4 h-4" />
                )}
                {!isPrinting && !isSuccess && (
                  <span className="material-symbols-outlined text-sm">print</span>
                )}
                <span>
                  {isPrinting ? 'Processing...' : isSuccess ? 'Success!' : 'Print'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

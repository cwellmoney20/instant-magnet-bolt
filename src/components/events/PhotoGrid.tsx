import PolaroidCard from './PolaroidCard';
import FilterTabs, { type FilterValue } from './FilterTabs';
import BatchActionBar from './BatchActionBar';
import { PolaroidSkeleton } from '../ui/LoadingSkeleton';
import type { Photo, PhotoStatus } from '../../types/database';

interface PhotoGridProps {
  photos: Photo[];
  loading: boolean;
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  selectedIds: Set<string>;
  selectedStatus: PhotoStatus | null;
  isMixedStatus: boolean;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onForwardBatch: () => void;
  onBackwardBatch: () => void;
  onReprint: (photoId: string) => void;
  onResendNotification: (photoId: string) => void;
  isPaidEvent?: boolean;
  highlightedIds?: Set<string>;
}

export default function PhotoGrid({
  photos,
  loading,
  activeFilter,
  onFilterChange,
  selectedIds,
  selectedStatus,
  isMixedStatus,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onForwardBatch,
  onBackwardBatch,
  onReprint,
  onResendNotification,
  isPaidEvent = false,
  highlightedIds = new Set(),
}: PhotoGridProps) {
  const counts: Record<PhotoStatus, number> = {
    new: 0,
    printed: 0,
    completed: 0,
  };

  for (const photo of photos) {
    counts[photo.status]++;
  }

  const unpaidCount = photos.filter((p) => p.payment_status === 'unpaid').length;

  function filterPhotos(filter: FilterValue): Photo[] {
    if (filter === 'all') return photos;
    if (filter === 'unpaid') return photos.filter((p) => p.payment_status === 'unpaid');
    return photos.filter((p) => p.status === filter);
  }

  const filtered = filterPhotos(activeFilter);
  const selectableFiltered = filtered.filter((p) => p.status !== 'completed' && p.payment_status !== 'unpaid');
  const allFilteredSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((p) => selectedIds.has(p.id));

  function handleSelectAllToggle() {
    if (allFilteredSelected) {
      onClearSelection();
    } else {
      onSelectAll(selectableFiltered.map((p) => p.id));
    }
  }

  return (
    <div>
      <FilterTabs
        active={activeFilter}
        onChange={(f) => {
          onClearSelection();
          onFilterChange(f);
        }}
        counts={counts}
        total={photos.length}
        unpaidCount={unpaidCount}
        showUnpaid={isPaidEvent}
      />

      {selectableFiltered.length > 0 && !loading && (
        <div className="mt-3">
          <button
            onClick={handleSelectAllToggle}
            className="flex items-center gap-1.5 font-mono-brand text-label-tag text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                allFilteredSelected
                  ? 'bg-secondary border-secondary'
                  : 'border-outline-variant hover:border-secondary'
              }`}
            >
              {allFilteredSelected && (
                <span className="material-symbols-outlined text-on-secondary" style={{ fontSize: '10px' }}>
                  check
                </span>
              )}
            </div>
            {allFilteredSelected ? 'DESELECT ALL' : 'SELECT ALL'}
          </button>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <PolaroidSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4">
              photo_library
            </span>
            <p className="font-mono-brand text-label-tag text-on-surface-variant">
              {activeFilter === 'all' ? 'NO PHOTOS YET' :
               activeFilter === 'unpaid' ? 'NO UNPAID PHOTOS' :
               `NO ${activeFilter.toUpperCase()} PHOTOS`}
            </p>
            {activeFilter === 'all' && (
              <p className="font-jakarta text-sm text-on-surface-variant mt-2 max-w-xs">
                Share the QR code with guests so they can start uploading.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((photo) => (
              <PolaroidCard
                key={photo.id}
                photo={photo}
                selected={selectedIds.has(photo.id)}
                onToggle={onToggleSelect}
                onReprint={onReprint}
                onResendNotification={onResendNotification}
                highlighted={highlightedIds.has(photo.id)}
              />
            ))}
          </div>
        )}
      </div>

      <BatchActionBar
        selectedIds={selectedIds}
        selectedStatus={selectedStatus}
        onForward={onForwardBatch}
        onBackward={onBackwardBatch}
        onClear={onClearSelection}
        isMixedStatus={isMixedStatus}
      />
    </div>
  );
}

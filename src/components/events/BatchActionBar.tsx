import { useMemo } from 'react';
import type { PhotoStatus } from '../../types/database';
import { getTransitions } from '../../lib/photos';

interface BatchActionBarProps {
  selectedIds: Set<string>;
  selectedStatus: PhotoStatus | null;
  onForward: () => void;
  onBackward: () => void;
  onClear: () => void;
  isMixedStatus: boolean;
}

export default function BatchActionBar({
  selectedIds,
  selectedStatus,
  onForward,
  onBackward,
  onClear,
  isMixedStatus,
}: BatchActionBarProps) {
  const count = selectedIds.size;
  const transitions = useMemo(
    () => (selectedStatus ? getTransitions(selectedStatus) : null),
    [selectedStatus]
  );

  if (count === 0) return null;

  return (
    <div className="sticky bottom-4 z-30 mt-6 mx-auto max-w-2xl">
      <div className="bg-on-surface text-inverse-on-surface rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] border border-on-surface/20 px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Count badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-primary text-on-primary font-mono-brand text-label-tag px-2 py-0.5 rounded-full">
            {count}
          </span>
          <span className="font-mono-brand text-label-tag text-inverse-on-surface/80">
            {count === 1 ? 'PHOTO SELECTED' : 'PHOTOS SELECTED'}
          </span>
        </div>

        {isMixedStatus && (
          <span className="font-jakarta text-sm text-tertiary-fixed-dim flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span>
            Select same status to move
          </span>
        )}

        {!isMixedStatus && transitions && (
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Backward */}
            {transitions.backward && (
              <button
                onClick={onBackward}
                className="flex items-center gap-1.5 font-mono-brand text-label-tag bg-surface-container-highest text-on-surface px-3 py-2 rounded-lg hover:bg-surface-variant transition-colors btn-extruded"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                {transitions.backward.label.toUpperCase()}
              </button>
            )}

            {/* Forward */}
            {transitions.forward && (
              <button
                onClick={onForward}
                className="flex items-center gap-1.5 font-mono-brand text-label-tag bg-primary text-on-primary px-3 py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors btn-extruded"
              >
                {transitions.forward.label.toUpperCase()}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            )}
          </div>
        )}

        {/* Clear */}
        <button
          onClick={onClear}
          className="ml-auto flex-shrink-0 flex items-center gap-1 font-mono-brand text-label-tag text-inverse-on-surface/60 hover:text-inverse-on-surface transition-colors"
          aria-label="Clear selection"
        >
          <span className="material-symbols-outlined text-sm">close</span>
          CLEAR
        </button>
      </div>
    </div>
  );
}

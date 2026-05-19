import { useMemo } from 'react';
import StatusBadge from '../ui/StatusBadge';
import CompletedPhotoMenu from './CompletedPhotoMenu';
import type { Photo } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface PolaroidCardProps {
  photo: Photo;
  selected: boolean;
  onToggle: (id: string) => void;
  onReprint: (photoId: string) => void;
  onResendNotification: (photoId: string) => void;
  highlighted?: boolean;
}

export default function PolaroidCard({
  photo,
  selected,
  onToggle,
  onReprint,
  onResendNotification,
  highlighted = false,
}: PolaroidCardProps) {
  const rotation = useMemo(() => {
    const rotations = [-3, -2, -1, 0, 1, 2, 3];
    const index = photo.id.charCodeAt(0) % rotations.length;
    return rotations[index];
  }, [photo.id]);

  const isCompleted = photo.status === 'completed';
  const isUnpaid = photo.payment_status === 'unpaid';
  const isSelectable = !isCompleted && !isUnpaid;

  const imageUrl = supabase.storage
    .from('event-photos')
    .getPublicUrl(photo.storage_path).data.publicUrl;

  const guestName = photo.event_guests?.name ?? '';

  return (
    <div
      data-photo-highlight={highlighted ? 'true' : undefined}
      className={`polaroid-card relative transition-transform duration-300 ${
        isSelectable ? 'cursor-pointer hover:rotate-0' : 'cursor-default'
      } ${isCompleted ? 'opacity-75' : ''} ${highlighted ? 'ring-2 ring-green-400 ring-offset-1 rounded-sm' : ''}`}
      style={{ transform: `rotate(${selected ? 0 : rotation}deg)` }}
      onClick={() => isSelectable && onToggle(photo.id)}
    >
      {/* Selection checkbox for selectable photos */}
      {isSelectable && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selected
                ? 'bg-secondary border-secondary'
                : 'bg-white/90 border-outline-variant hover:border-secondary'
            }`}
          >
            {selected && (
              <span className="material-symbols-outlined text-on-secondary" style={{ fontSize: '14px' }}>
                check
              </span>
            )}
          </div>
        </div>
      )}

      {/* Unpaid badge overlay */}
      {isUnpaid && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-primary-container text-on-primary-container font-mono-brand text-[9px] px-2 py-0.5 rounded flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>payments</span>
            UNPAID
          </div>
        </div>
      )}

      {/* Selected highlight ring */}
      {selected && (
        <div className="absolute inset-0 rounded-sm ring-2 ring-secondary ring-offset-1 z-10 pointer-events-none" />
      )}

      {/* Photo */}
      <div className="relative overflow-hidden border border-surface-variant">
        <img
          src={imageUrl}
          alt={`Photo by ${guestName}`}
          className={`w-full aspect-square object-cover ${isCompleted ? 'grayscale-[30%]' : ''} ${isUnpaid ? 'opacity-60' : ''}`}
          loading="lazy"
        />
        <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] pointer-events-none" />
      </div>

      {/* Bottom strip */}
      <div className="flex items-center justify-between mt-2 px-1">
        {guestName && (
          <p className="font-mono-brand text-[10px] text-on-surface-variant truncate max-w-[60%]">
            {guestName}
          </p>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          <StatusBadge status={photo.status} />
          {isCompleted && (
            <CompletedPhotoMenu
              photoId={photo.id}
              onReprint={onReprint}
              onResendNotification={onResendNotification}
            />
          )}
        </div>
      </div>
    </div>
  );
}

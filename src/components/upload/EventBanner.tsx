import { supabase } from '../../lib/supabase';
import type { Event } from '../../types/database';

interface EventBannerProps {
  event: Event;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function EventBanner({ event }: EventBannerProps) {
  const coverUrl = event.cover_photo_path
    ? supabase.storage.from('event-photos').getPublicUrl(event.cover_photo_path).data.publicUrl
    : null;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '220px' }}>
      {coverUrl ? (
        <>
          <img
            src={coverUrl}
            alt={event.title}
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </>
      ) : (
        <div className="w-full h-56 bg-gradient-to-br from-surface-container to-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">photo_camera</span>
        </div>
      )}

      <div className={`${coverUrl ? 'absolute bottom-0 left-0 right-0 text-white' : 'text-on-surface'} px-6 pb-6 pt-4`}>
        <h1 className={`font-jakarta font-bold text-2xl leading-tight ${coverUrl ? 'text-white' : 'text-on-surface'}`}>
          {event.title}
        </h1>
        <p className={`font-jakarta text-sm mt-1 flex flex-wrap items-center gap-3 ${coverUrl ? 'text-white/80' : 'text-on-surface-variant'}`}>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            {formatDate(event.date)}
          </span>
          {event.location && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base">location_on</span>
              {event.location}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

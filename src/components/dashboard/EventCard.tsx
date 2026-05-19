import { useNavigate } from 'react-router-dom';
import DymoLabel from '../ui/DymoLabel';
import type { Event } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { useNotifications } from '../../context/NotificationContext';

interface EventCardProps {
  event: Event;
  photoCount: number;
  newCount: number;
}

const eventTypeIcon: Record<string, string> = {
  wedding: 'favorite',
  market: 'storefront',
  birthday: 'cake',
  corporate: 'business',
  other: 'celebration',
};

const statusConfig = {
  active: { label: 'LIVE', variant: 'red' as const },
  draft: { label: 'DRAFT', variant: 'gray' as const },
  archived: { label: 'ARCHIVED', variant: 'gray' as const },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EventCard({ event, photoCount, newCount }: EventCardProps) {
  const navigate = useNavigate();
  const { notifications, clearNotification } = useNotifications();
  const statusInfo = statusConfig[event.status];
  const icon = eventTypeIcon[event.event_type || 'other'];
  const hasRealtimeUploads = notifications.some((n) => n.eventId === event.id);

  const coverUrl = event.cover_photo_path
    ? supabase.storage.from('event-photos').getPublicUrl(event.cover_photo_path).data.publicUrl
    : null;

  function handleClick() {
    if (hasRealtimeUploads) clearNotification(event.id);
    navigate(`/events/${event.id}`);
  }

  return (
    <div
      onClick={handleClick}
      className="relative bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant shadow-sm cursor-pointer group hover:shadow-md transition-shadow duration-200"
    >
      {/* Cover image */}
      <div className="relative w-full h-48 bg-surface-container-high overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-40">
              {icon}
            </span>
          </div>
        )}
        {event.status !== 'active' && (
          <div className="absolute top-3 left-3">
            <DymoLabel variant={statusInfo.variant}>{statusInfo.label}</DymoLabel>
          </div>
        )}
        {hasRealtimeUploads ? (
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full animate-pulse">
              New Uploads
            </span>
          </div>
        ) : newCount > 0 ? (
          <div className="absolute top-3 right-3">
            <span className="bg-tertiary text-on-tertiary font-mono-brand text-label-tag px-2 py-1 rounded-full text-[10px]">
              {newCount} NEW
            </span>
          </div>
        ) : null}
      </div>

      {/* Card body */}
      <div className="p-5">
        <h3 className="font-jakarta font-bold text-lg text-on-surface leading-snug group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-col gap-1.5 mt-2">
          <p className="flex items-center gap-2 font-jakarta text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            {formatDate(event.date)}
            {event.time && ` · ${event.time.slice(0, 5)}`}
          </p>
          {event.location && (
            <p className="flex items-center gap-2 font-jakarta text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-base">location_on</span>
              {event.location}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant">
          <div className="flex gap-3">
            <div className="text-center">
              <p className="font-jakarta font-bold text-on-surface">{photoCount}</p>
              <p className="font-mono-brand text-[10px] text-on-surface-variant">PHOTOS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {event.is_paid_event && (
              <span
                className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-full px-1.5 py-0.5"
                title="Paid event"
              >
                <span className="material-symbols-outlined text-[11px]" style={{ fontSize: '11px' }}>payments</span>
                <span className="font-mono-brand text-[9px] font-semibold">PAID</span>
              </span>
            )}
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-base">link</span>
              <span className="font-mono-brand text-[10px] text-on-surface-variant truncate max-w-24">
                {event.slug}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

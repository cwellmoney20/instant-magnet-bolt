import DymoLabel from '../ui/DymoLabel';
import type { Event } from '../../types/database';

interface EventHeaderProps {
  event: Event;
  onBack: () => void;
  onDelete: () => void;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const statusConfig = {
  active: { label: 'LIVE EVENT', variant: 'red' as const },
  draft: { label: 'DRAFT', variant: 'gray' as const },
  archived: { label: 'ARCHIVED', variant: 'gray' as const },
};

export default function EventHeader({ event, onBack, onDelete }: EventHeaderProps) {
  const { label, variant } = statusConfig[event.status];

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 font-mono-brand text-label-tag text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          ALL EVENTS
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline text-on-surface-variant font-mono-brand text-label-tag hover:bg-error-container/30 hover:border-error/40 hover:text-error transition-colors"
          title="Delete event"
        >
          <span className="material-symbols-outlined text-base">delete</span>
          DELETE
        </button>
      </div>

      <div>
        <DymoLabel variant={variant} className="mb-3 inline-block">{label}</DymoLabel>
        <h1 className="font-jakarta font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight">
          {event.title}
        </h1>
        <p className="font-jakarta text-body-md text-on-surface-variant mt-2 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">calendar_today</span>
            {formatDate(event.date)}
            {event.time && ` · ${event.time.slice(0, 5)}`}
          </span>
          {event.location && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">location_on</span>
              {event.location}
            </span>
          )}
        </p>
      </div>
    </header>
  );
}

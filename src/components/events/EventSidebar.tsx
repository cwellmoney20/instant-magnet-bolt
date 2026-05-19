import QRCodeDisplay from '../ui/QRCodeDisplay';
import DymoLabel from '../ui/DymoLabel';
import type { PhotoStatus } from '../../types/database';

interface EventSidebarProps {
  eventId: string;
  slug: string;
  statusCounts: Record<PhotoStatus, number>;
  totalCount: number;
  onSettingsClick: () => void;
  isPaidEvent?: boolean;
  unpaidCount?: number;
}

export default function EventSidebar({
  slug,
  statusCounts,
  totalCount,
  onSettingsClick,
  isPaidEvent = false,
  unpaidCount = 0,
}: EventSidebarProps) {
  const publicUrl = `${window.location.origin}/upload/${slug}`;

  const stats = [
    { label: 'Total Photos', value: totalCount, color: 'text-on-surface' },
    { label: 'New', value: statusCounts.new, color: 'text-on-surface' },
    { label: 'Printed', value: statusCounts.printed, color: 'text-on-surface-variant' },
    { label: 'Completed', value: statusCounts.completed, color: 'text-tertiary' },
  ];

  return (
    <aside className="flex flex-col gap-4">
      {/* Stats */}
      <div className="bg-surface-container p-5 rounded-xl shadow-sm border border-outline-variant">
        <h3 className="font-jakarta font-bold text-lg text-on-surface mb-4">Event Details</h3>
        <div className="space-y-3">
          {stats.map(({ label, value, color }) => (
            <div key={label} className="flex justify-between items-center border-b border-outline-variant pb-2 last:border-0 last:pb-0">
              <span className="font-jakarta text-sm text-on-surface-variant">{label}</span>
              <span className={`font-jakarta font-bold ${color}`}>{value}</span>
            </div>
          ))}

        </div>

        {isPaidEvent && (
          <div className="mt-3 px-3 py-2 bg-primary-container/30 rounded-lg border border-primary-container">
            <p className="font-mono-brand text-[10px] text-on-primary-container flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">credit_card</span>
              PAID EVENT
            </p>
          </div>
        )}

        <button
          onClick={onSettingsClick}
          className="mt-4 w-full bg-surface-bright text-on-surface border border-outline font-mono-brand text-label-tag py-2 rounded-lg btn-extruded flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
          Settings
        </button>
      </div>

      {/* QR Code */}
      <div className="inset-desk p-5 rounded-xl border border-outline-variant flex flex-col items-center text-center">
        <DymoLabel className="mb-4 inline-block">SCAN TO UPLOAD</DymoLabel>
        <QRCodeDisplay value={publicUrl} size={148} />
        <p className="font-mono-brand text-[10px] text-on-surface-variant mt-3 break-all">
          {publicUrl.replace('http://', '').replace('https://', '')}
        </p>
        <button
          onClick={() => navigator.clipboard.writeText(publicUrl)}
          className="mt-3 flex items-center gap-1.5 font-mono-brand text-label-tag text-secondary hover:text-on-secondary-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm">content_copy</span>
          COPY LINK
        </button>
      </div>
    </aside>
  );
}

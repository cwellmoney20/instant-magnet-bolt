import { useNavigate } from 'react-router-dom';
import ExtrudedButton from '../ui/ExtrudedButton';

interface DashboardHeaderProps {
  totalEvents: number;
  totalPhotos: number;
}

export default function DashboardHeader({ totalEvents, totalPhotos }: DashboardHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
      <div>
        <span className="dymo-label text-[10px] mb-3 inline-block">DASHBOARD</span>
        <h1 className="font-jakarta font-bold text-headline-lg-mobile md:text-headline-lg text-on-surface leading-tight">
          Events
        </h1>
        <p className="font-jakarta text-body-md text-on-surface-variant mt-2">
          Manage your photo collection events and track fulfillment.
        </p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-4 bg-surface-container rounded-xl px-5 py-3 border border-outline-variant shadow-inset-desk">
          <div className="text-center">
            <p className="font-jakarta font-bold text-2xl text-on-surface">{totalEvents}</p>
            <p className="font-mono-brand text-label-tag text-on-surface-variant">EVENTS</p>
          </div>
          <div className="w-px bg-outline-variant" />
          <div className="text-center">
            <p className="font-jakarta font-bold text-2xl text-on-surface">{totalPhotos}</p>
            <p className="font-mono-brand text-label-tag text-on-surface-variant">PHOTOS</p>
          </div>
        </div>

        <ExtrudedButton
          variant="primary"
          onClick={() => navigate('/events/create')}
          icon={<span className="material-symbols-outlined text-base">add_circle</span>}
        >
          Create Event
        </ExtrudedButton>
      </div>
    </div>
  );
}

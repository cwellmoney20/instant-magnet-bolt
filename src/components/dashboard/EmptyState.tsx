import { useNavigate } from 'react-router-dom';
import ExtrudedButton from '../ui/ExtrudedButton';

export default function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="relative mb-8">
        {/* Decorative polaroid stack */}
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 bg-white polaroid-shadow rounded-sm rotate-[-8deg] transform" />
          <div className="absolute inset-0 bg-white polaroid-shadow rounded-sm rotate-[4deg] transform" />
          <div className="absolute inset-0 bg-surface-container rounded-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant opacity-30">
              photo_camera
            </span>
          </div>
        </div>
      </div>

      <span className="dymo-label text-[10px] mb-4 inline-block">NO EVENTS YET</span>

      <h2 className="font-jakarta font-bold text-2xl text-on-surface mb-3">
        Your desk is empty
      </h2>
      <p className="font-jakarta text-body-md text-on-surface-variant max-w-sm mb-8">
        Create your first event to get a unique QR code guests can scan to upload their photos.
      </p>

      <ExtrudedButton
        variant="primary"
        size="lg"
        onClick={() => navigate('/events/create')}
        icon={<span className="material-symbols-outlined">add_circle</span>}
      >
        Create Your First Event
      </ExtrudedButton>
    </div>
  );
}

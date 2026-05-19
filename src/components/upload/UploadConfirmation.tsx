interface UploadConfirmationProps {
  eventTitle: string;
  guestEmail: string;
  onUploadAnother: () => void;
}

export default function UploadConfirmation({ eventTitle, guestEmail, onUploadAnother }: UploadConfirmationProps) {
  return (
    <div className="flex flex-col items-center text-center py-8 px-4 space-y-6">
      {/* Success icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <span className="material-symbols-outlined text-xl text-on-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            photo_camera
          </span>
        </div>
      </div>

      <div>
        <span className="dymo-label text-[10px] mb-3 inline-block">PHOTO RECEIVED</span>
        <h2 className="font-jakarta font-bold text-2xl text-on-surface">
          You're all set!
        </h2>
        <p className="font-jakarta text-body-md text-on-surface-variant mt-3 max-w-xs">
          Your photo has been submitted for <strong className="text-on-surface">{eventTitle}</strong>.
        </p>
      </div>

      {/* Email notification note */}
      <div className="w-full bg-secondary-fixed rounded-xl p-4 text-left">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
            email
          </span>
          <div>
            <p className="font-mono-brand text-label-tag text-on-secondary-container mb-1">
              MAGNET NOTIFICATION
            </p>
            <p className="font-jakarta text-sm text-on-secondary-container">
              We'll send an email to <strong>{guestEmail}</strong> when your photo magnet is ready.
            </p>
          </div>
        </div>
      </div>

      {/* Decorative polaroid */}
      <div className="flex gap-3 opacity-60">
        {[-3, 0, 3].map((rot, i) => (
          <div
            key={i}
            className="w-14 h-14 bg-surface-container-high polaroid-shadow rounded-sm"
            style={{ transform: `rotate(${rot}deg)` }}
          />
        ))}
      </div>

      <button
        onClick={onUploadAnother}
        className="font-mono-brand text-label-tag text-secondary hover:text-on-secondary-container transition-colors flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-base">add_photo_alternate</span>
        UPLOAD ANOTHER PHOTO
      </button>
    </div>
  );
}

import { useState } from 'react';
import type { Event } from '../../types/database';

interface DeleteEventModalProps {
  event: Event;
  onClose: () => void;
  onConfirm: () => Promise<{ error: string | null }>;
  onDeleted: () => void;
}

export default function DeleteEventModal({ event, onClose, onConfirm, onDeleted }: DeleteEventModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const { error: err } = await onConfirm();

    setDeleting(false);

    if (err) {
      setError(err);
      return;
    }

    onDeleted();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 pb-20 md:pb-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-scrim/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl border border-outline-variant flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error">delete_forever</span>
            <h2 className="font-jakarta font-bold text-title-md text-on-surface">Delete Event</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="font-jakarta text-body-md text-on-surface-variant">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-on-surface">{event.title}</span>?
          </p>
          <p className="font-jakarta text-body-sm text-on-surface-variant mt-2">
            The event will be removed from your dashboard. All photos are preserved and can be
            recovered by contacting support.
          </p>

          {error && (
            <p className="mt-4 font-jakarta text-sm text-error bg-error-container/30 border border-error/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-outline font-mono-brand text-label-tag text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 rounded-lg bg-error text-on-error font-mono-brand text-label-tag hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {deleting && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
            {deleting ? 'DELETING…' : 'DELETE EVENT'}
          </button>
        </div>
      </div>
    </div>
  );
}

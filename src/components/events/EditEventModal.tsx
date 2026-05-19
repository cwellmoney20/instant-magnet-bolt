import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import EventFormFields, { type FormValues } from './EventFormFields';
import type { Event } from '../../types/database';

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
  onSaved: (updated: Event) => void;
}

function toFormValues(event: Event): FormValues {
  return {
    title: event.title,
    event_type: event.event_type ?? 'other',
    date: event.date ?? '',
    time: event.time ?? '',
    location: event.location ?? '',
    description: event.description ?? '',
    is_paid_event: event.is_paid_event ?? false,
    photo_price_cents: event.photo_price_cents ?? null,
  };
}

export default function EditEventModal({ event, onClose, onSaved }: EditEventModalProps) {
  const [values, setValues] = useState<FormValues>(toFormValues(event));
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setValues(toFormValues(event));
  }, [event]);

  function handleChange(field: keyof FormValues, value: string | boolean | number | null) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormValues, string>> = {};
    if (!values.title.trim()) next.title = 'Title is required.';
    if (!values.date) next.date = 'Date is required.';
    if (values.is_paid_event && (values.photo_price_cents === null || values.photo_price_cents < 50)) {
      next.photo_price_cents = 'Price must be at least $0.50.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setServerError(null);

    const { data, error } = await supabase
      .from('events')
      .update({
        title: values.title.trim(),
        event_type: values.event_type,
        date: values.date,
        time: values.time || null,
        location: values.location.trim() || null,
        description: values.description.trim() || null,
        is_paid_event: values.is_paid_event,
        photo_price_cents: values.is_paid_event ? values.photo_price_cents : null,
      })
      .eq('id', event.id)
      .select()
      .maybeSingle();

    setSaving(false);

    if (error || !data) {
      setServerError('Failed to save changes. Please try again.');
      return;
    }

    onSaved(data as Event);
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
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-outline-variant flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            <h2 className="font-jakarta font-bold text-title-md text-on-surface">Event Settings</h2>
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
        <div className="overflow-y-auto px-6 py-6 flex-1">
          <EventFormFields values={values} onChange={handleChange} errors={errors} />

          {serverError && (
            <p className="mt-4 font-jakarta text-sm text-error bg-error-container/30 border border-error/20 rounded-lg px-4 py-3">
              {serverError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-outline font-mono-brand text-label-tag text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-mono-brand text-label-tag btn-extruded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
            {saving ? 'SAVING…' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </div>
  );
}

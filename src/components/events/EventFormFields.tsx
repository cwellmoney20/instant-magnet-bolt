import type { EventType } from '../../types/database';

const EVENT_TYPES: { value: EventType; label: string; icon: string }[] = [
  { value: 'wedding', label: 'Wedding', icon: 'favorite' },
  { value: 'market', label: 'Market', icon: 'storefront' },
  { value: 'birthday', label: 'Birthday', icon: 'cake' },
  { value: 'corporate', label: 'Corporate', icon: 'business' },
  { value: 'other', label: 'Other', icon: 'celebration' },
];

export interface FormValues {
  title: string;
  event_type: EventType;
  date: string;
  time: string;
  location: string;
  description: string;
  is_paid_event: boolean;
  photo_price_cents: number | null;
}

interface EventFormFieldsProps {
  values: FormValues;
  onChange: (field: keyof FormValues, value: string | boolean | number | null) => void;
  errors: Partial<Record<keyof FormValues, string>>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-mono-brand text-label-tag text-on-surface-variant mb-2">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 font-jakarta text-sm text-error">{error}</p>}
    </div>
  );
}

const inputClass = "w-full px-4 py-3 bg-surface rounded-lg border border-outline-variant focus:outline-none focus:border-primary transition-colors font-jakarta text-body-md text-on-surface placeholder:text-on-surface-variant/50";

export default function EventFormFields({ values, onChange, errors }: EventFormFieldsProps) {
  const priceInDollars = values.photo_price_cents !== null
    ? (values.photo_price_cents / 100).toFixed(2)
    : '';

  function handlePriceChange(raw: string) {
    if (raw === '') {
      onChange('photo_price_cents', null);
      return;
    }
    const dollars = parseFloat(raw);
    if (!isNaN(dollars) && dollars >= 0) {
      onChange('photo_price_cents', Math.round(dollars * 100));
    }
  }

  return (
    <div className="space-y-6">
      <Field label="EVENT TITLE *" error={errors.title}>
        <input
          type="text"
          value={values.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Smith-Jones Wedding"
          className={inputClass}
        />
      </Field>

      <Field label="EVENT TYPE">
        <div className="flex flex-wrap gap-2">
          {EVENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange('event_type', type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-mono-brand text-label-tag ${
                values.event_type === type.value
                  ? 'bg-primary-container text-on-primary-container border-primary shadow-inset-desk'
                  : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-base">{type.icon}</span>
              {type.label.toUpperCase()}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Field label="DATE *" error={errors.date}>
          <input
            type="date"
            value={values.date}
            onChange={(e) => onChange('date', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="TIME">
          <input
            type="time"
            value={values.time}
            onChange={(e) => onChange('time', e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="LOCATION">
        <input
          type="text"
          value={values.location}
          onChange={(e) => onChange('location', e.target.value)}
          placeholder="The Grand Estate, New York"
          className={inputClass}
        />
      </Field>

      <Field label="DESCRIPTION">
        <textarea
          value={values.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="A welcoming message for your guests..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {/* Pricing */}
      <div className="border-t border-outline-variant pt-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <p className="font-mono-brand text-label-tag text-on-surface">PAID PHOTO UPLOAD</p>
            <p className="font-jakarta text-sm text-on-surface-variant mt-1">
              Require guests to pay before their photo is accepted.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={values.is_paid_event}
            onClick={() => {
              const next = !values.is_paid_event;
              onChange('is_paid_event', next);
              if (!next) onChange('photo_price_cents', null);
            }}
            className={`relative inline-flex shrink-0 h-7 w-12 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              values.is_paid_event
                ? 'bg-primary border-primary'
                : 'bg-surface-container-high border-outline-variant'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 mt-px rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                values.is_paid_event ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {values.is_paid_event && (
          <div className="mt-4">
            <Field label="PRICE PER PHOTO (USD)" error={errors.photo_price_cents?.toString()}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-jakarta text-on-surface-variant select-none">
                  $
                </span>
                <input
                  type="number"
                  min="0.50"
                  step="0.01"
                  value={priceInDollars}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="5.00"
                  className={`${inputClass} pl-8`}
                />
              </div>
              <p className="mt-1.5 font-jakarta text-xs text-on-surface-variant">
                Minimum $0.50. Guests pay this amount before their photo is saved.
              </p>
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}

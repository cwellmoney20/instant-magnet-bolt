interface SlugFieldProps {
  value: string;
  onChange: (slug: string) => void;
  error?: string;
}

export default function SlugField({ value, onChange, error }: SlugFieldProps) {
  function sanitize(input: string) {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);
  }

  return (
    <div>
      <label className="block font-mono-brand text-label-tag text-on-surface-variant mb-2">
        PUBLIC URL SLUG
      </label>
      <div className="flex items-center rounded-lg overflow-hidden border border-outline-variant focus-within:border-primary transition-colors bg-surface">
        <span className="px-3 py-3 bg-surface-container text-on-surface-variant font-mono-brand text-sm border-r border-outline-variant whitespace-nowrap">
          /upload/
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(sanitize(e.target.value))}
          placeholder="event-slug"
          className="flex-1 px-3 py-3 bg-surface text-on-surface font-mono-brand text-sm outline-none placeholder:text-on-surface-variant/50"
        />
      </div>
      {error && (
        <p className="mt-1 font-jakarta text-sm text-error">{error}</p>
      )}
      {value && !error && (
        <p className="mt-1 font-mono-brand text-[10px] text-on-surface-variant">
          GUESTS WILL VISIT: instant.event/upload/{value}
        </p>
      )}
    </div>
  );
}

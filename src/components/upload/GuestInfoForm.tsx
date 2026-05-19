import { useState } from 'react';
import ExtrudedButton from '../ui/ExtrudedButton';

interface GuestInfoFormProps {
  onSubmit: (name: string, email: string) => void;
  loading?: boolean;
}

export default function GuestInfoForm({ onSubmit, loading }: GuestInfoFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  function validate() {
    const errs: { name?: string; email?: string } = {};
    if (!name.trim()) errs.name = 'Please enter your name';
    if (!email.trim()) errs.email = 'Please enter your email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(name.trim(), email.trim().toLowerCase());
  }

  const inputClass = "w-full px-4 py-3.5 bg-surface rounded-xl border border-outline-variant focus:outline-none focus:border-primary transition-colors font-jakarta text-body-md text-on-surface placeholder:text-on-surface-variant/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block font-mono-brand text-label-tag text-on-surface-variant mb-2">
          YOUR NAME
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          autoComplete="name"
          className={inputClass}
        />
        {errors.name && <p className="mt-1 font-jakarta text-sm text-error">{errors.name}</p>}
      </div>

      <div>
        <label className="block font-mono-brand text-label-tag text-on-surface-variant mb-2">
          EMAIL ADDRESS
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          autoComplete="email"
          inputMode="email"
          className={inputClass}
        />
        {errors.email && <p className="mt-1 font-jakarta text-sm text-error">{errors.email}</p>}
        <p className="mt-1.5 font-jakarta text-xs text-on-surface-variant">
          We'll email you when your photo magnet is ready.
        </p>
      </div>

      <ExtrudedButton
        variant="primary"
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full justify-center"
        icon={loading
          ? <span className="material-symbols-outlined text-base animate-spin">sync</span>
          : <span className="material-symbols-outlined text-base">arrow_forward</span>
        }
      >
        {loading ? 'Saving...' : 'Continue to Photo'}
      </ExtrudedButton>
    </form>
  );
}

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      navigate('/');
    }
  }

  const passwordsMatch = confirm.length > 0 && password === confirm;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-16">
      {/* Decorative strips */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary-container opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-container opacity-60" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary-container rounded-2xl btn-extruded flex items-center justify-center mb-4">
            <Camera size={32} className="text-on-primary-container" />
          </div>
          <h1 className="font-jakarta font-bold text-3xl text-on-surface tracking-tight">InstantEvent</h1>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl polaroid-shadow p-8">
          <h2 className="font-jakarta font-bold text-xl text-on-surface mb-1">Create your account</h2>
          <p className="font-jakarta text-sm text-on-surface-variant mb-6">Start managing events in minutes.</p>

          {error && (
            <div className="flex items-start gap-2 bg-error-container text-on-error-container rounded-lg px-4 py-3 mb-5 text-sm font-jakarta">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="font-mono-brand text-label-tag text-on-surface-variant block mb-2">
                EMAIL
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant text-on-surface font-jakarta text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors shadow-inner"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="font-mono-brand text-label-tag text-on-surface-variant block mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-9 pr-4 py-3 bg-surface-container rounded-lg border border-outline-variant text-on-surface font-jakarta text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors shadow-inner"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="font-mono-brand text-label-tag text-on-surface-variant block mb-2">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-10 py-3 bg-surface-container rounded-lg border border-outline-variant text-on-surface font-jakarta text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors shadow-inner"
                />
                {passwordsMatch && (
                  <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-primary-container text-on-primary-container font-mono-brand text-label-tag py-3 rounded-lg btn-extruded hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
              ) : (
                'CREATE ACCOUNT'
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-jakarta text-sm text-on-surface-variant mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

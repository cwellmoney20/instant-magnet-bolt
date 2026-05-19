import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Lock } from 'lucide-react';
import DymoLabel from '../components/ui/DymoLabel';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';

const FREE_FEATURES = [
  'Up to 3 events',
  'Guest photo uploads via QR code',
  'Real-time photo dashboard',
  'Paid photo upload gate (per event)',
  'Email notifications on print complete',
];

const PRO_FEATURES = [
  'Unlimited events',
  'Guest photo uploads via QR code',
  'Real-time photo dashboard',
  'Paid photo upload gate (per event)',
  'Email notifications on print complete',
  'Priority support',
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const { plan, planLoading } = usePlan();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpgrade() {
    if (!session) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            success_url: `${window.location.origin}/?upgraded=true`,
            cancel_url: `${window.location.origin}/upgrade`,
          }),
        }
      );

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Could not start checkout. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Could not start checkout. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-4xl">
      <div className="mb-10">
        <DymoLabel className="mb-3 inline-block">PLANS & PRICING</DymoLabel>
        <h1 className="font-jakarta font-bold text-headline-lg-mobile md:text-4xl text-on-surface">
          Simple, honest pricing
        </h1>
        <p className="font-jakarta text-body-md text-on-surface-variant mt-2 max-w-lg">
          Start free and upgrade when you're ready to run more events.
        </p>
      </div>

      {planLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 animate-pulse">
              <div className="h-5 w-24 bg-surface-container-high rounded mb-4" />
              <div className="h-10 w-32 bg-surface-container-high rounded mb-6" />
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-surface-container-high rounded w-3/4" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free tier */}
          <div className="relative rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
            {plan === 'free' && (
              <div className="absolute top-5 right-5">
                <DymoLabel variant="gray">CURRENT PLAN</DymoLabel>
              </div>
            )}
            <div className="mb-6">
              <p className="font-mono-brand text-label-tag text-on-surface-variant mb-2">FREE</p>
              <div className="flex items-baseline gap-1">
                <span className="font-jakarta font-bold text-4xl text-on-surface">$0</span>
                <span className="font-jakarta text-on-surface-variant">/month</span>
              </div>
              <p className="font-jakarta text-sm text-on-surface-variant mt-2">
                Perfect for getting started
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  {i === 0 ? (
                    <Lock size={15} className="text-on-surface-variant mt-0.5 shrink-0" />
                  ) : (
                    <Check size={15} className="text-green-600 mt-0.5 shrink-0" />
                  )}
                  <span className="font-jakarta text-sm text-on-surface">{feat}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-lg border border-outline-variant bg-surface-container px-4 py-3">
              <p className="font-jakarta text-sm text-on-surface-variant text-center">
                {plan === 'free' ? 'Your current plan' : 'Downgraded plan'}
              </p>
            </div>
          </div>

          {/* Pro tier */}
          <div className="relative rounded-2xl border-2 border-primary bg-surface-container-lowest p-8 shadow-[0_4px_24px_rgba(115,92,0,0.12)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-on-primary font-mono-brand text-[10px] px-3 py-1 rounded-full whitespace-nowrap tracking-widest">
                RECOMMENDED
              </span>
            </div>

            {plan === 'pro' && (
              <div className="absolute top-5 right-5">
                <DymoLabel variant="blue">CURRENT PLAN</DymoLabel>
              </div>
            )}

            <div className="mb-6">
              <p className="font-mono-brand text-label-tag text-primary mb-2">PRO</p>
              <div className="flex items-baseline gap-1">
                <span className="font-jakarta font-bold text-4xl text-on-surface">$1</span>
                <span className="font-jakarta text-on-surface-variant">/month</span>
              </div>
              <p className="font-jakarta text-sm text-on-surface-variant mt-2">
                Unlimited events, no restrictions
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check size={15} className="text-primary mt-0.5 shrink-0" />
                  <span className={`font-jakarta text-sm ${i === 0 ? 'text-primary font-semibold' : 'text-on-surface'}`}>
                    {feat}
                  </span>
                </li>
              ))}
            </ul>

            {error && (
              <p className="mb-3 font-jakarta text-sm text-error bg-error-container rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {plan === 'pro' ? (
              <button
                onClick={() => navigate('/billing')}
                className="w-full py-3.5 rounded-xl bg-surface-container border border-outline-variant font-mono-brand text-label-tag text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                MANAGE SUBSCRIPTION
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-mono-brand text-label-tag btn-extruded hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                    REDIRECTING...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    UPGRADE NOW — $1/MO
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <p className="mt-8 font-jakarta text-sm text-on-surface-variant text-center">
        Cancel anytime. No hidden fees.
      </p>
    </div>
  );
}

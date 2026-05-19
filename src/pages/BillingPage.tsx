import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Zap, CheckCircle } from 'lucide-react';
import DymoLabel from '../components/ui/DymoLabel';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BillingPage() {
  const { plan, currentPeriodEnd, subscriptionStatus, hasStripeCustomer, planLoading } = usePlan();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleManageSubscription() {
    if (!session) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-billing-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            return_url: `${window.location.origin}/billing`,
          }),
        }
      );

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Could not open billing portal. Please try again.');
        setLoading(false);
      }
    } catch {
      setError('Could not open billing portal. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-2xl">
      <div className="mb-8">
        <DymoLabel className="mb-3 inline-block">BILLING</DymoLabel>
        <h1 className="font-jakarta font-bold text-headline-lg-mobile md:text-4xl text-on-surface">
          Subscription
        </h1>
        <p className="font-jakarta text-body-md text-on-surface-variant mt-2">
          Manage your plan and payment details.
        </p>
      </div>

      {planLoading ? (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 animate-pulse space-y-4">
          <div className="h-5 w-32 bg-surface-container-high rounded" />
          <div className="h-10 w-24 bg-surface-container-high rounded" />
          <div className="h-4 w-48 bg-surface-container-high rounded" />
        </div>
      ) : (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
          {/* Plan badge */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono-brand text-label-tag text-on-surface-variant mb-1">CURRENT PLAN</p>
              <div className="flex items-center gap-2">
                <Zap size={18} className={plan === 'pro' ? 'text-primary' : 'text-on-surface-variant'} />
                <span className="font-jakarta font-bold text-2xl text-on-surface capitalize">{plan}</span>
                {plan === 'pro' && subscriptionStatus === 'active' && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
              </div>
            </div>
            {plan === 'free' ? (
              <DymoLabel variant="gray">FREE</DymoLabel>
            ) : (
              <DymoLabel variant="blue">PRO</DymoLabel>
            )}
          </div>

          <div className="border-t border-outline-variant pt-6 space-y-4">
            {plan === 'pro' && (
              <>
                {subscriptionStatus && (
                  <div className="flex justify-between items-center">
                    <span className="font-mono-brand text-label-tag text-on-surface-variant">STATUS</span>
                    <span className={`font-jakarta text-sm font-semibold capitalize ${
                      subscriptionStatus === 'active' ? 'text-green-700' :
                      subscriptionStatus === 'past_due' ? 'text-error' : 'text-on-surface-variant'
                    }`}>
                      {subscriptionStatus}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-mono-brand text-label-tag text-on-surface-variant">AMOUNT</span>
                  <span className="font-jakarta text-sm text-on-surface">$1.00 / month</span>
                </div>
                {currentPeriodEnd && (
                  <div className="flex justify-between items-center">
                    <span className="font-mono-brand text-label-tag text-on-surface-variant">RENEWS</span>
                    <span className="font-jakarta text-sm text-on-surface">{formatDate(currentPeriodEnd)}</span>
                  </div>
                )}
              </>
            )}

            {plan === 'free' && (
              <div className="rounded-xl bg-surface-container border border-outline-variant px-5 py-4 flex flex-col gap-3">
                <p className="font-jakarta text-sm text-on-surface-variant">
                  You're on the free plan — limited to 3 events. Upgrade for $1/month to create unlimited events.
                </p>
                <Link
                  to="/upgrade"
                  className="inline-flex items-center gap-2 bg-primary text-on-primary font-mono-brand text-label-tag py-2.5 px-4 rounded-lg btn-extruded hover:bg-primary/90 transition-colors self-start"
                >
                  <Zap size={13} />
                  UPGRADE TO PRO
                </Link>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-4 font-jakarta text-sm text-error bg-error-container rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          {plan === 'pro' && hasStripeCustomer && (
            <div className="mt-6 pt-6 border-t border-outline-variant">
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="flex items-center gap-2 font-jakarta text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">sync</span>
                    Opening portal...
                  </>
                ) : (
                  <>
                    <ExternalLink size={15} />
                    Manage subscription & payment method
                  </>
                )}
              </button>
              <p className="font-jakarta text-xs text-on-surface-variant mt-1.5">
                Cancel, update payment method, or download invoices via Stripe's secure portal.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

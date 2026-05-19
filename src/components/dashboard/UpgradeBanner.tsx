import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function UpgradeBanner() {
  return (
    <div className="mb-6 rounded-xl border border-primary-container bg-gradient-to-r from-primary-container/40 to-secondary-fixed/30 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary-container border border-outline-variant flex items-center justify-center shrink-0">
          <Zap size={16} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-jakarta font-semibold text-sm text-on-surface">
            You've reached the 3-event free limit
          </p>
          <p className="font-jakarta text-sm text-on-surface-variant mt-0.5">
            Upgrade to Pro for $1/month to create unlimited events.
          </p>
        </div>
      </div>
      <Link
        to="/upgrade"
        className="shrink-0 bg-primary text-on-primary font-mono-brand text-label-tag py-2.5 px-5 rounded-lg btn-extruded hover:bg-primary/90 transition-colors whitespace-nowrap"
      >
        UPGRADE TO PRO
      </Link>
    </div>
  );
}

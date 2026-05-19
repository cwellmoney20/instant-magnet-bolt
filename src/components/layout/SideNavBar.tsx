import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlan } from '../../context/PlanContext';

export default function SideNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { plan, eventCount, canCreateEvent } = usePlan();

  const isEventsActive = location.pathname === '/' || location.pathname.startsWith('/events');
  const isBillingActive = location.pathname === '/billing';

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 pt-20 z-40 bg-surface-container border-r border-outline-variant shadow-[4px_0_12px_rgba(0,0,0,0.05)]">
      <nav className="flex flex-col gap-1 flex-grow px-3 pt-4">
        <Link
          to="/"
          className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
            isEventsActive
              ? 'bg-surface-bright text-on-surface font-semibold shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-bright/60'
          }`}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: isEventsActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            event
          </span>
          <span className="font-mono-brand text-label-tag">Events</span>
        </Link>

        <Link
          to="/billing"
          className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-all ${
            isBillingActive
              ? 'bg-surface-bright text-on-surface font-semibold shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-bright/60'
          }`}
        >
          <span
            className="material-symbols-outlined text-xl"
            style={{ fontVariationSettings: isBillingActive ? "'FILL' 1" : "'FILL' 0" }}
          >
            credit_card
          </span>
          <span className="font-mono-brand text-label-tag">Billing</span>
        </Link>
      </nav>

      {/* Plan badge */}
      <div className="px-4 pb-2">
        {plan === 'free' ? (
          <Link
            to="/upgrade"
            className="w-full flex items-center gap-2 bg-primary-container/50 border border-outline-variant rounded-lg px-3 py-2.5 hover:bg-primary-container transition-colors"
          >
            <Zap size={13} className="text-primary shrink-0" />
            <div className="min-w-0">
              <p className="font-mono-brand text-[10px] text-primary leading-tight">FREE PLAN</p>
              <p className="font-jakarta text-[11px] text-on-surface-variant leading-tight mt-0.5">
                {eventCount}/3 events used
              </p>
            </div>
          </Link>
        ) : (
          <div className="w-full flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-lg px-3 py-2.5">
            <Zap size={13} className="text-secondary shrink-0" />
            <p className="font-mono-brand text-[10px] text-secondary leading-tight">PRO PLAN</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 mt-2 flex flex-col gap-3">
        {!canCreateEvent && (
          <Link
            to="/upgrade"
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-mono-brand text-label-tag py-2.5 rounded-lg btn-extruded hover:bg-primary/90 transition-colors"
          >
            UPGRADE TO PRO
          </Link>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 text-on-surface-variant font-mono-brand text-label-tag py-2.5 rounded-lg hover:bg-surface-bright transition-colors"
        >
          <LogOut size={14} />
          SIGN OUT
        </button>
      </div>
    </aside>
  );
}

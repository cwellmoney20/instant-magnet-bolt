import { Link, useLocation, useNavigate } from 'react-router-dom';
import { usePlan } from '../../context/PlanContext';

export default function BottomNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canCreateEvent } = usePlan();
  const isEvents = location.pathname === '/' || location.pathname.startsWith('/events');
  const isBilling = location.pathname === '/billing';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden justify-around items-center bg-surface-container-highest border-t border-outline-variant shadow-nav px-4 py-3 pb-safe">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${isEvents ? 'text-primary' : 'text-on-surface-variant'}`}
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isEvents ? "'FILL' 1" : "'FILL' 0" }}>
          home
        </span>
        <span className="font-mono-brand text-[10px]">Events</span>
      </Link>

      <button
        onClick={() => navigate(canCreateEvent ? '/events/create' : '/upgrade')}
        className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-full w-14 h-14 shadow-md active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined text-2xl">{canCreateEvent ? 'add' : 'lock'}</span>
      </button>

      <Link
        to="/billing"
        className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${isBilling ? 'text-primary' : 'text-on-surface-variant'}`}
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: isBilling ? "'FILL' 1" : "'FILL' 0" }}>
          credit_card
        </span>
        <span className="font-mono-brand text-[10px]">Billing</span>
      </Link>
    </nav>
  );
}

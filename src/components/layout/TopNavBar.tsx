import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Zap } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { usePlan } from '../../context/PlanContext';

export default function TopNavBar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { notifications, clearNotification } = useNotifications();
  const { canCreateEvent } = usePlan();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasUnread = notifications.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  function handleNotificationClick(eventId: string, uploadsPath: string) {
    clearNotification(eventId);
    setDropdownOpen(false);
    navigate(uploadsPath);
  }

  return (
    <nav className="bg-surface-container-lowest border-b border-outline-variant shadow-sm fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 md:px-10 py-4">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 font-jakarta font-bold text-xl text-secondary tracking-tight">
          <Zap size={18} className="text-secondary" />
          InstantMagnet
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(canCreateEvent ? '/events/create' : '/upgrade')}
          className="bg-primary-container text-on-primary-container font-mono-brand text-label-tag py-2 px-4 rounded-lg btn-extruded hover:bg-primary hover:text-on-primary transition-colors hidden md:flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
            {canCreateEvent ? 'add_circle' : 'lock'}
          </span>
          {canCreateEvent ? 'Create Event' : 'Upgrade to Create'}
        </button>

        {/* Notification bell with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="relative text-on-surface-variant p-2 rounded-full hover:bg-surface-variant transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-lowest" />
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-outline-variant">
                <p className="font-jakarta font-semibold text-sm text-on-surface">Notifications</p>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Bell size={24} className="mx-auto mb-2 text-on-surface-variant opacity-40" />
                  <p className="font-jakarta text-sm text-on-surface-variant">No new notifications</p>
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li key={n.eventId}>
                      <button
                        onClick={() => handleNotificationClick(n.eventId, n.uploadsPath)}
                        className="w-full text-left px-4 py-3 hover:bg-surface-container transition-colors flex items-start gap-3"
                      >
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-jakarta text-sm font-medium text-on-surface truncate">
                            {n.eventName}
                          </p>
                          <p className="font-jakarta text-xs text-on-surface-variant mt-0.5">
                            New photos uploaded
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <button
          onClick={async () => { await signOut(); navigate('/login'); }}
          className="text-on-surface-variant p-2 rounded-full hover:bg-surface-variant transition-colors"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}

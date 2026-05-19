import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import EventCard from '../components/dashboard/EventCard';
import EmptyState from '../components/dashboard/EmptyState';
import UpgradeBanner from '../components/dashboard/UpgradeBanner';
import { EventCardSkeleton } from '../components/ui/LoadingSkeleton';
import { supabase } from '../lib/supabase';
import { usePlan } from '../context/PlanContext';
import type { Event } from '../types/database';

interface EventWithCounts extends Event {
  photoCount: number;
  newCount: number;
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [upgradeToast, setUpgradeToast] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { plan, eventCount, canCreateEvent, planLoading, refreshPlan } = usePlan();

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setUpgradeToast(true);
      setSearchParams({}, { replace: true });
      refreshPlan();
      const t = setTimeout(() => setUpgradeToast(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams, setSearchParams, refreshPlan]);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (!eventsData) {
      setLoading(false);
      return;
    }

    const eventsWithCounts = await Promise.all(
      eventsData.map(async (event) => {
        const { count: photoCount } = await supabase
          .from('photos')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);

        const { count: newCount } = await supabase
          .from('photos')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'new');

        return {
          ...event,
          photoCount: photoCount ?? 0,
          newCount: newCount ?? 0,
        };
      })
    );

    const total = eventsWithCounts.reduce((sum, e) => sum + e.photoCount, 0);
    setTotalPhotos(total);
    setEvents(eventsWithCounts);
    setLoading(false);
  }

  return (
    <div className="px-6 md:px-10 py-8">
      {upgradeToast && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
          <p className="font-jakarta text-sm font-semibold text-green-800">
            Welcome to Pro! You can now create unlimited events.
          </p>
        </div>
      )}

      {!planLoading && plan === 'free' && eventCount >= 3 && (
        <UpgradeBanner />
      )}

      <DashboardHeader totalEvents={events.length} totalPhotos={totalPhotos} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              photoCount={event.photoCount}
              newCount={event.newCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}

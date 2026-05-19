import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface UploadNotification {
  eventId: string;
  eventName: string;
  uploadsPath: string;
}

interface NotificationContextValue {
  notifications: UploadNotification[];
  clearNotification: (eventId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

interface Props {
  children: ReactNode;
}

export function NotificationProvider({ children }: Props) {
  const [notifications, setNotifications] = useState<UploadNotification[]>([]);
  // Cache event titles to avoid re-fetching
  const eventNameCache = useRef<Record<string, string>>({});

  const clearNotification = useCallback((eventId: string) => {
    setNotifications((prev) => prev.filter((n) => n.eventId !== eventId));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-new-uploads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos' },
        async (payload) => {
          const eventId = (payload.new as { event_id: string }).event_id;
          if (!eventId) return;

          setNotifications((prev) => {
            if (prev.some((n) => n.eventId === eventId)) return prev;

            const cachedName = eventNameCache.current[eventId];
            const notif: UploadNotification = {
              eventId,
              eventName: cachedName ?? 'Event',
              uploadsPath: `/events/${eventId}`,
            };
            return [...prev, notif];
          });

          // If we didn't have the name cached, fetch it and backfill
          if (!eventNameCache.current[eventId]) {
            const { data } = await supabase
              .from('events')
              .select('id, title')
              .eq('id', eventId)
              .maybeSingle();
            if (data) {
              eventNameCache.current[eventId] = data.title;
              setNotifications((prev) =>
                prev.map((n) =>
                  n.eventId === eventId ? { ...n, eventName: data.title } : n
                )
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, clearNotification, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

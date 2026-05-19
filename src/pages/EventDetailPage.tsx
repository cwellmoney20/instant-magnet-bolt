import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EventHeader from '../components/events/EventHeader';
import EventSidebar from '../components/events/EventSidebar';
import PhotoGrid from '../components/events/PhotoGrid';
import BatchConfirmModal from '../components/events/BatchConfirmModal';
import PrintPreviewModal from '../components/events/PrintPreviewModal';
import EditEventModal from '../components/events/EditEventModal';
import DeleteEventModal from '../components/events/DeleteEventModal';
import { supabase } from '../lib/supabase';
import { updatePhotoStatuses, getTransitions, triggerResendNotification } from '../lib/photos';
import type { Event, Photo, PhotoStatus } from '../types/database';
import type { FilterValue } from '../components/events/FilterTabs';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastCounter = 0;

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [pendingMove, setPendingMove] = useState<{
    targetStatus: PhotoStatus;
    targetLabel: string;
    photos: Photo[];
  } | null>(null);
  const [pendingPrint, setPendingPrint] = useState<Photo[] | null>(null);

  useEffect(() => {
    if (!id) return;
    loadEvent();
    loadPhotos();
    const unsub = subscribeToPhotos();
    return () => { unsub(); };
  }, [id]);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    const tid = ++toastCounter;
    setToasts((prev) => [...prev, { id: tid, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== tid));
    }, 3500);
  }

  async function loadEvent() {
    setLoadingEvent(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    setEvent(data);
    setLoadingEvent(false);
  }

  async function loadPhotos(silent = false) {
    if (!silent) setLoadingPhotos(true);
    const { data } = await supabase
      .from('photos')
      .select('*, event_guests(name, email)')
      .eq('event_id', id)
      .order('uploaded_at', { ascending: false });
    setPhotos((data as Photo[]) ?? []);
    if (!silent) setLoadingPhotos(false);
  }

  function subscribeToPhotos() {
    const channel = supabase
      .channel(`photos:event_id=eq.${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'photos', filter: `event_id=eq.${id}` },
        () => { loadPhotos(true); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }

  const handleToggleSelect = useCallback((photoId: string) => {
    setSelectedIds((prev) => {
      const clickedPhoto = photos.find((p) => p.id === photoId);
      if (!clickedPhoto || clickedPhoto.status === 'completed' || clickedPhoto.payment_status === 'unpaid') return prev;

      const next = new Set(prev);

      if (next.has(photoId)) {
        next.delete(photoId);
        return next;
      }

      // If there's an existing selection of a different status, reset and select only this one
      if (prev.size > 0) {
        const existingStatus = photos.find((p) => prev.has(p.id))?.status;
        if (existingStatus && existingStatus !== clickedPhoto.status) {
          return new Set([photoId]);
        }
      }

      next.add(photoId);
      return next;
    });
  }, [photos]);

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const { selectedStatus, isMixedStatus } = useMemo(() => {
    if (selectedIds.size === 0) return { selectedStatus: null, isMixedStatus: false };
    const statuses = new Set(
      Array.from(selectedIds)
        .map((sid) => photos.find((p) => p.id === sid)?.status)
        .filter((s): s is PhotoStatus => !!s)
    );
    if (statuses.size > 1) return { selectedStatus: null, isMixedStatus: true };
    return { selectedStatus: Array.from(statuses)[0] ?? null, isMixedStatus: false };
  }, [selectedIds, photos]);

  async function executeBatchMove(ids: string[], targetStatus: PhotoStatus, label: string) {
    const idSet = new Set(ids);
    // Optimistic update — apply status change immediately in local state
    setPhotos((prev) =>
      prev.map((p) => (idSet.has(p.id) ? { ...p, status: targetStatus } : p))
    );
    setSelectedIds(new Set());

    const { failedIds } = await updatePhotoStatuses(ids, targetStatus);

    if (failedIds.length === 0) {
      if (targetStatus === 'completed') {
        // Fire-and-forget notifications for each completed photo; edge function handles deduplication
        ids.forEach((photoId) => triggerResendNotification(photoId).catch(() => {}));
        showToast(`${ids.length} photo${ids.length !== 1 ? 's' : ''} completed — guests notified by email`);
      } else {
        showToast(`${ids.length} photo${ids.length !== 1 ? 's' : ''} moved to ${label}`);
      }
    } else {
      // Revert failed photos and show error
      showToast(`Failed to move ${failedIds.length} photo${failedIds.length !== 1 ? 's' : ''}`, 'error');
      setSelectedIds(new Set(failedIds));
    }
    // Silent background reconcile to sync any server-side changes
    loadPhotos(true);
  }

  function handleForwardBatch() {
    if (!selectedStatus) return;
    const transitions = getTransitions(selectedStatus);
    if (!transitions.forward) return;

    const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));

    // Show print preview before moving new → printed
    if (selectedStatus === 'new' && transitions.forward.status === 'printed') {
      setPendingPrint(selectedPhotos);
      return;
    }

    if (selectedIds.size === 1) {
      executeBatchMove(Array.from(selectedIds), transitions.forward.status, transitions.forward.label);
      return;
    }

    setPendingMove({
      targetStatus: transitions.forward.status,
      targetLabel: transitions.forward.label,
      photos: selectedPhotos,
    });
  }

  function handleBackwardBatch() {
    if (!selectedStatus) return;
    const transitions = getTransitions(selectedStatus);
    if (!transitions.backward) return;

    const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));

    if (selectedIds.size === 1) {
      executeBatchMove(Array.from(selectedIds), transitions.backward.status, transitions.backward.label);
      return;
    }

    setPendingMove({
      targetStatus: transitions.backward.status,
      targetLabel: transitions.backward.label,
      photos: selectedPhotos,
    });
  }

  function handleModalConfirm(ids: string[]) {
    if (!pendingMove) return;
    const { targetStatus, targetLabel } = pendingMove;
    setPendingMove(null);
    executeBatchMove(ids, targetStatus, targetLabel);
  }

  function handlePrintConfirm(ids: string[], _photosToRender: Photo[]) {
    executeBatchMove(ids, 'printed', 'Printed');
  }

  function handleSkipPrint(ids: string[]) {
    setPendingPrint(null);
    executeBatchMove(ids, 'printed', 'Printed');
  }

  function handlePrintComplete(ids: string[]) {
    setPendingPrint(null);
    setActiveFilter('printed');
    const idSet = new Set(ids);
    setHighlightedIds(idSet);
    setTimeout(() => setHighlightedIds(new Set()), 2200);
    // Scroll to first highlighted item after tab switch renders
    setTimeout(() => {
      const el = document.querySelector('[data-photo-highlight="true"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  async function handleReprint(photoId: string) {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, status: 'printed' as PhotoStatus } : p))
    );
    const { failedIds } = await updatePhotoStatuses([photoId], 'printed');
    if (failedIds.length === 0) {
      showToast('Photo sent back to printed');
    } else {
      showToast('Failed to reprint photo', 'error');
    }
    loadPhotos(true);
  }

  async function handleResendNotification(photoId: string) {
    try {
      await triggerResendNotification(photoId);
      showToast('Notification resent to guest');
    } catch {
      showToast('Failed to resend notification', 'error');
    }
  }

  const statusCounts: Record<PhotoStatus, number> = {
    new: photos.filter((p) => p.status === 'new').length,
    printed: photos.filter((p) => p.status === 'printed').length,
    completed: photos.filter((p) => p.status === 'completed').length,
  };

  const unpaidCount = photos.filter((p) => p.payment_status === 'unpaid').length;

  if (loadingEvent) {
    return (
      <div className="px-6 md:px-10 py-8 flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">sync</span>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="px-6 md:px-10 py-8 text-center">
        <p className="font-jakarta text-on-surface-variant">Event not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 font-mono-brand text-label-tag text-secondary hover:underline">
          BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-8">
      <EventHeader event={event} onBack={() => navigate('/')} onDelete={() => setShowDeleteModal(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <EventSidebar
            eventId={event.id}
            slug={event.slug}
            statusCounts={statusCounts}
            totalCount={photos.length}
            onSettingsClick={() => setShowEditModal(true)}
            isPaidEvent={event.is_paid_event}
            unpaidCount={unpaidCount}
          />
        </div>

        <div className="lg:col-span-9 bg-surface-container-low p-6 rounded-xl border border-outline-variant shadow-sm min-h-96">
          <PhotoGrid
            photos={photos}
            loading={loadingPhotos}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            selectedIds={selectedIds}
            selectedStatus={selectedStatus}
            isMixedStatus={isMixedStatus}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onForwardBatch={handleForwardBatch}
            onBackwardBatch={handleBackwardBatch}
            onReprint={handleReprint}
            onResendNotification={handleResendNotification}
            isPaidEvent={event.is_paid_event}
            highlightedIds={highlightedIds}
          />
        </div>
      </div>

      {showDeleteModal && (
        <DeleteEventModal
          event={event}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            const { error: err } = await supabase
              .from('events')
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', event.id);
            return { error: err ? 'Failed to delete event. Please try again.' : null };
          }}
          onDeleted={() => navigate('/')}
        />
      )}

      {showEditModal && (
        <EditEventModal
          event={event}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => {
            setEvent(updated);
            setShowEditModal(false);
            showToast('Event details saved');
          }}
        />
      )}

      {pendingPrint && (
        <PrintPreviewModal
          photos={pendingPrint}
          onConfirmPrint={handlePrintConfirm}
          onSkipPrint={handleSkipPrint}
          onCancel={() => setPendingPrint(null)}
          onPrintComplete={handlePrintComplete}
        />
      )}

      {pendingMove && (
        <BatchConfirmModal
          photos={pendingMove.photos}
          targetStatus={pendingMove.targetStatus}
          targetLabel={pendingMove.targetLabel}
          onConfirm={handleModalConfirm}
          onCancel={() => setPendingMove(null)}
        />
      )}

      {/* Toast stack */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`font-jakarta text-sm px-5 py-3 rounded-xl shadow-lg border flex items-center gap-2 pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-on-surface text-inverse-on-surface border-on-surface/20'
                : 'bg-error-container text-on-error-container border-error/20'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

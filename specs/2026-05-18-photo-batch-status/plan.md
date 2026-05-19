# Photo Batch Status Management — Plan

## Task Groups

### Group 1 — Data Layer
- [x] Create `src/lib/photos.ts` with `updatePhotoStatuses(ids, newStatus)`, `getTransitions(status)`, and `triggerResendNotification(photoId)` helpers

### Group 2 — New Components
- [x] `src/components/events/BatchActionBar.tsx` — sticky floating bar with selection count, forward/back CTAs, and clear button
- [x] `src/components/events/BatchConfirmModal.tsx` — thumbnail review modal with per-photo remove before confirming batch
- [x] `src/components/events/CompletedPhotoMenu.tsx` — kebab dropdown on completed cards: Reprint + Resend Notification

### Group 3 — Updated Components
- [x] `PolaroidCard` — selectable on new/printing/printed; completed shows CompletedPhotoMenu in bottom strip; blue selection ring
- [x] `PhotoGrid` — Select All toggle, clears selection on filter change, renders BatchActionBar inline
- [x] `EventHeader` — simplified to pure display component; action buttons removed

### Group 4 — Page Wiring
- [x] `EventDetailPage` — unified `executeBatchMove` handler, optimistic state updates, silent background reconcile, toast notifications, modal state management, reprint and resend handlers

### Group 5 — Smooth Transitions
- [x] `loadPhotos(silent)` flag — skips skeleton on background reconcile after status changes
- [x] Optimistic `setPhotos()` update before network call so UI responds instantly
- [x] CSS `transition` on `.dymo-label` (background-color, color) for smooth badge color swap
- [x] CSS `transition` on `.polaroid-card` (opacity, transform) for smooth card state change

### Group 6 — Spec & Roadmap
- [x] `specs/2026-05-18-photo-batch-status/requirements.md`
- [x] `specs/2026-05-18-photo-batch-status/validation.md`
- [x] Updated `specs/roadmap.md` with Phase 9

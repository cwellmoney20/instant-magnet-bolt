# Print Preview Modal — Plan

## Task Groups

### 1. PrintPreviewModal Component
- `src/components/events/PrintPreviewModal.tsx`
  - Props: `photos`, `onConfirmPrint(ids)`, `onSkipPrint(ids)`, `onCancel()`
  - State: `excluded: Set<string>`, `currentPage: number`
  - Screen UI: header, info banner with page controls, 3×3 photo grid preview, excluded strip, footer with Cancel / Skip Print / Print & Mark Printed
  - Print-only UI: hidden on screen, visible during `window.print()` — renders all included photos in paginated 3×3 grid with polaroid styling

### 2. Print CSS
- `src/index.css`
  - `@media print` block: hides all body content except `.print-only`
  - `.no-print` utility class: hides the modal screen UI during print
  - `.print-page`: 3-column CSS grid with `page-break-after: always`
  - `.print-polaroid`, `.print-photo-img`, `.print-photo-caption`: polaroid card styling for print

### 3. EventDetailPage Integration
- `src/pages/EventDetailPage.tsx`
  - Add `pendingPrint: Photo[] | null` state
  - In `handleForwardBatch`: detect `new → printed` transition, set `pendingPrint` instead of going to `BatchConfirmModal` or executing immediately
  - Add `handlePrintConfirm(ids)`: closes modal, calls `executeBatchMove(ids, 'printed', 'Printed')`
  - Add `handleSkipPrint(ids)`: same as above without print
  - Render `<PrintPreviewModal>` conditionally when `pendingPrint !== null`

### 4. Spec Documentation
- `specs/2026-05-19-print-preview-modal/requirements.md`
- `specs/2026-05-19-print-preview-modal/plan.md`
- `specs/2026-05-19-print-preview-modal/validation.md`
- Update `specs/roadmap.md` Phase 13

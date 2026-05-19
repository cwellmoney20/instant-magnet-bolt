# Photo Batch Status Management — Requirements

## Scope

Enable the event detail page to support batch selection and status transitions for photos through the print lifecycle (new → printing → printed → completed), with backward moves where applicable, a confirmation modal for multi-photo batches, and special actions on completed photos.

## Status Lifecycle

```
new ⇄ printing ⇄ printed → completed (terminal)
```

- **Forward transitions:** new → printing, printing → printed, printed → completed
- **Backward transitions:** printing → new, printed → printing
- `completed` is terminal — no backward transition from the UI (Reprint is handled separately as a special action)
- Completed photos have dedicated actions: Reprint (moves back to printing) and Resend Notification

## Selection Rules

- Only photos of the same status may belong to an active selection batch
- Clicking a photo of a different status from the current selection clears the selection and selects only that new photo
- `completed` photos are excluded from batch selection entirely
- Select All selects all non-completed photos visible in the current filter view

## Action Flow

### Single photo selected
Clicking Forward or Backward executes immediately with no confirmation modal.

### Multiple photos selected
Clicking Forward or Backward opens the BatchConfirmModal before committing.

### BatchConfirmModal
- Shows a scrollable thumbnail grid of all selected photos
- Each thumbnail has an X button to remove it from the batch (status unchanged)
- Header shows the pending action label
- Confirm executes the Supabase batch update for remaining photos; Cancel dismisses with no changes
- Confirm is disabled if all photos have been removed from the batch

## Completed Photo Actions

- **Reprint:** moves status back to `printing` (immediate, no modal)
- **Resend Notification:** triggers the `notify-magnet-ready` edge function for that photo's guest

## Transition UX

- Status changes are applied **optimistically** — local state updates immediately before the network call
- The skeleton loader is never shown for background reconciliation after an action
- A silent `loadPhotos()` reconciles server state after each action without interrupting the UI
- The `.dymo-label` status badge cross-fades its background color on change

## Feedback

- A toast notification appears for every status move (success) or failure
- Failed photo IDs remain selected after a failed batch so the user can retry
- Partial failures show the count of photos that failed to move

## Constraints

- Status transitions are validated client-side via `getTransitions(status)` before sending to Supabase
- The BatchActionBar is only visible when 1+ photos are selected
- Switching filter tabs clears the current selection

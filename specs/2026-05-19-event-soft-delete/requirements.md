# Event Soft Delete — Requirements

## Scope

Allow event owners to delete an event from the dashboard. Deletion is a soft-delete: the event row is preserved in the database with a `deleted_at` timestamp, so photos and guest records remain intact for potential recovery. Deleted events do not appear on the dashboard or in any query.

## Decisions

- **Soft delete over hard delete**: photos (and their Stripe records) are valuable data; hard deletion could cause issues with Stripe reconciliation and customer disputes.
- **`deleted_at` column, not a status value**: keeps the soft-delete concern orthogonal to the `status` workflow (draft/active/archived). A deleted event could be in any status.
- **RLS filtering**: the SELECT and UPDATE policies on `events` are updated to exclude rows where `deleted_at IS NOT NULL`. This means deleted events are invisible to the client without any application-layer filtering.
- **No undo in UI**: recovery is a manual admin operation (setting `deleted_at = NULL`). This keeps the UI simple.
- **Confirmation modal**: a dedicated modal shows the event title and uses error/destructive colors to make the action feel appropriately serious.

## Context

- Requested as a straightforward UX improvement — users need a way to remove test events or cancelled events from the dashboard.
- Delete button is placed in `EventHeader` so it is only accessible from inside the event detail view, reducing accidental deletion from the dashboard.

# Event Soft Delete — Validation

## Success Criteria

### Functional
- [ ] Opening an event detail page shows a DELETE button in the top-right of the header
- [ ] Clicking DELETE opens a confirmation modal showing the event title
- [ ] Clicking CANCEL in the modal closes it without any changes
- [ ] Clicking DELETE EVENT in the modal:
  - Sets `deleted_at` on the event row in Supabase
  - Navigates back to the dashboard immediately
  - The deleted event no longer appears in the dashboard event list

### Data Integrity
- [ ] After deletion, the `events` row still exists in Supabase with `deleted_at` populated
- [ ] Photos belonging to the deleted event are still present in the `photos` table
- [ ] Directly querying Supabase (as the owner) for the event by ID returns no result (RLS filters it)

### Security
- [ ] Unauthenticated users cannot soft-delete events (RLS blocks UPDATE without auth)
- [ ] A user cannot delete another user's event (RLS `user_id = auth.uid()` check)

### Edge Cases
- [ ] If the Supabase update fails, an inline error message is shown in the modal
- [ ] The DELETE EVENT button shows a loading spinner during the request

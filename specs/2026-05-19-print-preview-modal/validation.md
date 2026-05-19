# Print Preview Modal — Validation

## Acceptance Criteria

### Modal Trigger
- [ ] Selecting one or more "New" photos and clicking the forward arrow opens the print preview modal
- [ ] The `printed → completed` transition does NOT show the print modal (goes straight to BatchConfirmModal for multi-select)

### Photo Grid
- [ ] All selected photos appear in the 3×3 grid preview
- [ ] Hovering over a photo reveals the X (remove) button
- [ ] Clicking X removes the photo from the grid and moves it to the "Excluded" strip below
- [ ] Clicking an excluded photo in the strip re-adds it to the grid
- [ ] Empty cell placeholders fill the remaining slots in the last row
- [ ] The footer count accurately reflects included photo count

### Pagination
- [ ] With ≤9 included photos, no page controls appear
- [ ] With 10+ included photos, page controls appear in the info banner
- [ ] Previous/Next buttons navigate between pages of 9
- [ ] Page label reads "PAGE X / Y"

### Print Action
- [ ] Clicking "PRINT & MARK PRINTED" opens the browser print dialogue
- [ ] After the print dialogue closes (regardless of whether user actually printed), the modal closes and photos advance to "Printed"
- [ ] The browser print dialogue shows a clean 3×3 grid of polaroid-style photo cells on white background
- [ ] Page breaks separate every 9 photos when more than one page is needed
- [ ] The modal screen UI does not appear in the print output

### Skip Print Action
- [ ] Clicking "SKIP PRINT" closes the modal and advances included photos to "Printed" without opening the print dialogue

### Cancel Action
- [ ] Clicking "CANCEL" or the X button closes the modal with no status changes
- [ ] Photos remain selected in the grid after cancelling

### Edge Cases
- [ ] If all photos are excluded, "PRINT & MARK PRINTED" and "SKIP PRINT" buttons are disabled
- [ ] Single-photo "New" forward action also shows the print modal (not a direct status change)

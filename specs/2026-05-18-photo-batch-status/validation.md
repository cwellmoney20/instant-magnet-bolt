# Photo Batch Status Management — Validation

## How to test

Open an event with photos in various statuses. All scenarios below can be verified manually in the browser.

---

## Selection

- [ ] Clicking a **new** photo selects it (blue checkbox appears, no action bar flash)
- [ ] Clicking a **printing** photo selects it
- [ ] Clicking a **printed** photo selects it
- [ ] Clicking a **completed** photo does NOT select it (no checkbox shown)
- [ ] Clicking a photo of a **different status** than the current selection clears the previous selection and starts a new one with only that photo
- [ ] Clicking a selected photo again deselects it
- [ ] "SELECT ALL" selects all non-completed photos visible in the current filter view
- [ ] "DESELECT ALL" (shown when all are selected) clears selection
- [ ] Switching filter tabs clears the current selection

---

## Batch Action Bar

- [ ] Bar slides up from the bottom of the grid when 1+ photos are selected
- [ ] Bar disappears when selection is cleared
- [ ] Selected count badge shows the correct number
- [ ] Forward CTA label is correct per status:
  - new → "SEND TO PRINTING"
  - printing → "MARK AS PRINTED"
  - printed → "MARK AS COMPLETED"
- [ ] Backward CTA is absent when status is `new`
- [ ] Backward CTA label is correct:
  - printing → "MOVE BACK TO NEW"
  - printed → "MOVE BACK TO PRINTING"
- [ ] "CLEAR" button deselects all and dismisses the bar

---

## Single Photo Move (no modal)

- [ ] Select one photo → click Forward → status updates immediately with no modal, no skeleton flash
- [ ] Select one photo → click Backward → status updates immediately
- [ ] Status badge on the card smoothly cross-fades to the new color (no hard swap)
- [ ] Selection is cleared and a success toast appears after the move

---

## Batch Move (modal)

- [ ] Select 2+ photos → click Forward → BatchConfirmModal opens showing all selected thumbnails
- [ ] Each thumbnail shows guest name and an X button on hover
- [ ] Clicking X removes a photo from the batch (count in footer decreases; photo status unchanged)
- [ ] After removing all photos, Confirm button is disabled
- [ ] Clicking Cancel closes the modal with no status changes
- [ ] Clicking Confirm executes the update, closes the modal, clears selection, shows toast
- [ ] Photos update status immediately without skeleton flash (optimistic update)

---

## Smooth Transitions

- [ ] Status badge color cross-fades smoothly (no hard cut)
- [ ] The grid does NOT flash to skeletons when a batch move completes
- [ ] Realtime updates from other clients (or the subscription) do not cause a skeleton flash

---

## Completed Photo Actions

- [ ] Completed photo shows no checkbox and does not respond to click
- [ ] Completed photo shows a "..." (three-dot) menu button in the bottom strip
- [ ] Clicking "Reprint" moves the photo to `printing` status immediately with toast confirmation
- [ ] Clicking "Resend Notification" shows a success toast; no UI errors in console
- [ ] Menu closes after an action is selected

---

## Error Handling

- [ ] If a batch move fails (simulate by cutting network), a red error toast appears
- [ ] Failed photo IDs remain selected after the failure so the user can retry
- [ ] Toast auto-dismisses after ~3.5 seconds

---

## Shipped

- Phase built: 2026-05-18
- Smooth transition fix: 2026-05-18

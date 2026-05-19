# Print Preview Modal — Requirements

## Scope

When an admin moves photos from **New → Printed**, show a print preview modal before confirming the status change. The modal allows the admin to review the photos that will be printed, remove individual photos from the print job, and trigger the browser's native print dialogue. After printing (or skipping print), the photos advance to "Printed" status as normal.

## Decisions

- **Trigger:** Only intercepts the `new → printed` forward transition. The `printed → completed` transition is unaffected.
- **Photos per page:** 9 (3×3 grid). Matches a natural A4/Letter print layout.
- **Pagination:** When more than 9 photos are included, show page navigation controls in the modal header (Previous / Page N of M / Next). All pages print in a single `window.print()` call — the browser handles pagination automatically.
- **Exclusion:** The admin can click the X on any photo to exclude it from the print job. Excluded photos appear in a strip below and can be re-added.
- **Print then mark:** Clicking "PRINT & MARK PRINTED" triggers `window.print()` immediately, then closes the modal and advances all included photos to "Printed."
- **Skip print:** Clicking "SKIP PRINT" advances photos to "Printed" without opening the print dialogue. Useful when the printer is already running or photos were printed offline.
- **Cancel:** Closes the modal without changing any photo status.
- **Single photo:** Single-photo selections also go through the print preview (consistent UX).

## Context

The print workflow is central to the InstantEvent product — photos are physically printed as instant photo magnets. The modal gives the operator a final visual check before committing prints, reducing waste from accidental prints.

## Out of Scope

- No actual printer integration (hardware APIs, IPP, etc.)
- No per-photo crop or reorder within the modal
- No print settings (paper size, DPI) — deferred to browser print dialogue

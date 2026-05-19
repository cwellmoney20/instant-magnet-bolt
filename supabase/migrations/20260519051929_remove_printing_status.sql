/*
  # Remove "printing" photo status

  ## Summary
  Simplifies the photo workflow from 4 states (new → printing → printed → completed)
  to 3 states (new → printed → completed).

  ## Changes
  1. Migrates any existing photos with status='printing' back to status='new'
  2. Drops and recreates the status check constraint to exclude 'printing'

  ## Impact
  - No data is lost; printing photos are safely rolled back to new
  - The new valid statuses are: new, printed, completed
*/

-- Move any photos still in 'printing' back to 'new'
UPDATE photos SET status = 'new' WHERE status = 'printing';

-- Drop the old check constraint (if it exists) and add the new one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'photos' AND constraint_name = 'photos_status_check'
  ) THEN
    ALTER TABLE photos DROP CONSTRAINT photos_status_check;
  END IF;
END $$;

ALTER TABLE photos ADD CONSTRAINT photos_status_check
  CHECK (status IN ('new', 'printed', 'completed'));

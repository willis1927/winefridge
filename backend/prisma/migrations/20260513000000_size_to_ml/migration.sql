-- Change size column from VARCHAR(5) to DOUBLE PRECISION to store volume in ml
-- Existing values are set to NULL during migration (previous values were too short to be meaningful anyway)
ALTER TABLE stored_wines ALTER COLUMN size TYPE DOUBLE PRECISION USING NULL;

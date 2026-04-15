-- Drop the existing constraint and recreate it to allow NULL
ALTER TABLE stored_wines DROP FOREIGN KEY stored_wines_ibfk_4;

-- Re-add the foreign key to allow NULL values
ALTER TABLE stored_wines 
ADD CONSTRAINT stored_wines_ibfk_4 
FOREIGN KEY (full_lwin) REFERENCES vintage_info(full_lwin) ON DELETE SET NULL;

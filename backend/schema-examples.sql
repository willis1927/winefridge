-- Helper: Populate full_lwin field
-- Use this after inserting a wine into stored_wines to generate the full_lwin

UPDATE stored_wines 
SET full_lwin = CONCAT(lwin, vintage, size)
WHERE full_lwin IS NULL;

-- Example insert (full_lwin will auto-generate)
INSERT INTO stored_wines (owner_id, lwin, vintage, size, date_purchased, storage_id, notes)
VALUES (
  1,                          -- owner_id (user who owns this wine)
  'G00ABC123',               -- lwin (wine ID from lwin table)
  '2015',                    -- vintage
  '750ml',                   -- size
  '2024-01-15',              -- date_purchased
  1,                         -- storage_id (which storage location)
  'Great bottle, store upright'  -- notes
);

-- Manually set full_lwin if needed (format: lwin_vintage_size)
UPDATE stored_wines 
SET full_lwin = CONCAT(lwin, '_', vintage, '_', size)
WHERE storedID = 1;

-- Example: Insert vintage info for that wine
INSERT INTO vintage_info (full_lwin, drink_by_date, current_drink_state, ratings, awards, notes)
VALUES (
  'G00ABC123_2015_750ml',   -- full_lwin (must match stored_wines.full_lwin)
  '2025-12-31',              -- drink by date
  'Peak',                    -- current drinking state
  4.5,                       -- rating (1-5)
  'Gold Medal 2023',         -- awards
  'Beautiful wine, great balance'
);

-- Query to see all your stored wines with details
SELECT 
  sw.storedID,
  u.name as owner,
  l.display_name as wine_name,
  sw.vintage,
  sw.size,
  st.name as storage_location,
  sw.date_stored,
  vi.current_drink_state,
  vi.drink_by_date
FROM stored_wines sw
JOIN users u ON sw.owner_id = u.id
JOIN lwin l ON sw.lwin = l.lwin
LEFT JOIN storage st ON sw.storage_id = st.id
LEFT JOIN vintage_info vi ON sw.full_lwin = vi.full_lwin
ORDER BY sw.date_stored DESC;

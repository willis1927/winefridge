-- Migration Script: Add new tables to existing WineFridge database
-- Run this if you already have the users and lwin tables



-- Create storage table
CREATE TABLE storage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INT,
  owner_id INT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create vintage_info table
CREATE TABLE vintage_info (
  full_lwin VARCHAR(255) PRIMARY KEY,
  drink_by_date DATE,
  current_drink_state VARCHAR(255),
  ratings FLOAT,
  awards VARCHAR(255),
  notes VARCHAR(255)
);

-- Create stored_wines table
CREATE TABLE stored_wines (
  storedID INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  lwin VARCHAR(255) NOT NULL,
  vintage VARCHAR(4),
  size VARCHAR(5),
  full_lwin VARCHAR(255),
  date_purchased DATE,
  purchased_from VARCHAR(255),
  date_stored DATE,
  notes VARCHAR(255),
  storage_id INT,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lwin) REFERENCES lwin(lwin) ON DELETE CASCADE,
  FOREIGN KEY (storage_id) REFERENCES storage(id) ON DELETE SET NULL,
  FOREIGN KEY (full_lwin) REFERENCES vintage_info(full_lwin) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_stored_wines_owner ON stored_wines(owner_id);
CREATE INDEX idx_stored_wines_lwin ON stored_wines(lwin);
CREATE INDEX idx_stored_wines_storage ON stored_wines(storage_id);
CREATE INDEX idx_storage_owner ON storage(owner_id);

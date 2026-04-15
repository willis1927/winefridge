-- Full WineFridge Database Schema
-- Create from scratch with all tables and relationships

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lwin table (Wine database)
CREATE TABLE lwin (
  lwin VARCHAR(255) PRIMARY KEY,
  status VARCHAR(255),
  display_name VARCHAR(255),
  producer_title VARCHAR(255),
  producer_name VARCHAR(255),
  wine VARCHAR(255),
  country VARCHAR(255),
  region VARCHAR(255),
  sub_region VARCHAR(255),
  site VARCHAR(255),
  parcel VARCHAR(255),
  colour VARCHAR(255),
  type VARCHAR(255),
  sub_type VARCHAR(255),
  designation VARCHAR(255),
  classification VARCHAR(255),
  vintage_config VARCHAR(255),
  first_vintage VARCHAR(255),
  final_vintage VARCHAR(255),
  date_added VARCHAR(255),
  date_updated VARCHAR(255),
  reference VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create storage table (Wine storage locations)
CREATE TABLE storage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INT,
  owner_id INT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create vintage_info table (Vintage-specific information)
CREATE TABLE vintage_info (
  full_lwin VARCHAR(255) PRIMARY KEY,
  drink_by_date DATE,
  current_drink_state VARCHAR(255),
  ratings FLOAT,
  awards VARCHAR(255),
  notes VARCHAR(255)
);

-- Create stored_wines table (User's wine collection)
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

-- Create indexes for better query performance
CREATE INDEX idx_stored_wines_owner ON stored_wines(owner_id);
CREATE INDEX idx_stored_wines_lwin ON stored_wines(lwin);
CREATE INDEX idx_stored_wines_storage ON stored_wines(storage_id);
CREATE INDEX idx_storage_owner ON storage(owner_id);

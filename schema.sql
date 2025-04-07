-- schema.sql
-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bestcart_db;

-- Switch to using the new database
USE bestcart_db;

-- Drop tables in reverse order of dependency for easy resets during development
DROP TABLE IF EXISTS list_items;
DROP TABLE IF EXISTS shopping_lists;
DROP TABLE IF EXISTS store_products;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS stores;

-- Create tables:

CREATE TABLE stores (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(150) NOT NULL UNIQUE,
base_url VARCHAR(2048),
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
INDEX idx_store_name (name)
);

CREATE TABLE products (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   description TEXT,
   manufacturer VARCHAR(100),
   canonical_department VARCHAR(100), -- General category
   default_units VARCHAR(50), -- e.g., 'Kg', 'Litre', 'Unit'
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   INDEX idx_prod_name (name),
   INDEX idx_prod_manu (manufacturer)
   -- Maybe: UNIQUE KEY unique_product (name, manufacturer)
);

CREATE TABLE store_products (
   id INT AUTO_INCREMENT PRIMARY KEY,
   store_id INT NOT NULL,
   product_id INT NOT NULL,
   current_price DECIMAL(10, 2),
   product_url VARCHAR(2048),
   last_scraped_at TIMESTAMP NULL,
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE, -- If store deleted, remove its product links
   FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, -- If product deleted, remove its store links
   UNIQUE KEY unique_store_product (store_id, product_id) -- Can only link a product to a store once
);

CREATE TABLE shopping_lists (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   description TEXT,
   is_one_time BOOLEAN NOT NULL DEFAULT FALSE,
   is_template BOOLEAN NOT NULL DEFAULT FALSE,
   user_id INT, -- Nullable for now, link to users later
   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Add when users table exists
);

CREATE TABLE list_items (
   id INT AUTO_INCREMENT PRIMARY KEY,
   shopping_list_id INT NOT NULL,
   product_id INT NOT NULL,
   department_grouping VARCHAR(100), -- User-defined grouping for THIS list
   quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.0, -- Default to 1 unit
   units VARCHAR(50), -- Specific units for this list entry
   is_checked BOOLEAN NOT NULL DEFAULT FALSE,
   notes TEXT,
   added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE, -- If list deleted, remove its items
   FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, -- If master product deleted, remove from lists
   UNIQUE KEY unique_list_item (shopping_list_id, product_id) -- Optional: Prevent adding same product twice
);




-- Add sample data (adjust as needed)
INSERT INTO stores (name, base_url) VALUES
('Local Supermarket', 'http://example-supermarket.com'),
('Online Mart', 'http://example-onlinemart.com');

INSERT INTO products (name, manufacturer, canonical_department, default_units) VALUES
   ('Milk 1L', 'Tnuva', 'Dairy', 'Unit'),
   ('Bread Loaf', 'Angel Bakery', 'Bakery', 'Unit'),
   ('Apples (Kg)', NULL, 'Produce', 'Kg'); -- Manufacturer can be null

INSERT INTO store_products (store_id, product_id, current_price, product_url) VALUES
   (1, 1, 5.50, 'http://example-supermarket.com/milk'),
   (1, 2, 8.00, 'http://example-supermarket.com/bread'),
   (2, 3, 12.00, 'http://example-onlinemart.com/apples'),
   (2, 1, 5.80, 'http://example-onlinemart.com/milk'); -- Milk also at Online Mart

INSERT INTO shopping_lists (name, description, user_id) VALUES
   ('Weekly Shop', 'Standard groceries for the week', NULL), -- User ID null for now
   ('Party Supplies', 'Stuff for weekend BBQ', NULL);

   -- Assume list IDs are 1 and 2
INSERT INTO list_items (shopping_list_id, product_id, department_grouping, quantity, units) VALUES
   (1, 1, 'Dairy & Fridge', 2, 'Unit'), -- 2 Milks for weekly shop
   (1, 2, 'Bakery', 1, 'Unit'),        -- 1 Bread for weekly shop
   (1, 3, 'Fruit & Veg', 1.5, 'Kg'),   -- 1.5kg Apples for weekly shop
   (2, 2, 'Food', 3, 'Unit');          -- 3 Breads for the party
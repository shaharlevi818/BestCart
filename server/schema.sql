-- schema.sql for bestcart_db
-- Includes all tables based on discussion and EXPANDED sample data for each.

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS bestcart_db;

-- Switch to using the new database
USE bestcart_db;

-- Drop tables in reverse order of dependency for easy resets during development
DROP TABLE IF EXISTS list_items;
DROP TABLE IF EXISTS shopping_lists;
DROP TABLE IF EXISTS store_products;
DROP TABLE IF EXISTS users;        -- Drop users before stores due to preferred_store_id FK
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS stores;

-- Create stores table
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    base_url VARCHAR(2048) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_store_name (name)
);

-- Create products table (canonical items)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    manufacturer VARCHAR(100) NULL,
    canonical_department VARCHAR(100) NULL, -- General category
    default_units VARCHAR(50) NULL,         -- e.g., 'Kg', 'Litre', 'Unit'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_prod_name (name),
    INDEX idx_prod_manu (manufacturer)
    -- Consider: UNIQUE KEY unique_product (name, manufacturer)
);

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    -- IMPORTANT: Store a securely HASHED password (e.g., using bcrypt), never plain text!
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NULL,
    preferred_store_id INT NULL, -- Nullable FK to stores
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    -- If a preferred store is deleted, just set the preference to NULL, don't delete the user
    FOREIGN KEY (preferred_store_id) REFERENCES stores(id) ON DELETE SET NULL
);

-- Create store_products table (links products to stores with prices)
CREATE TABLE store_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    current_price DECIMAL(10, 2) NULL, -- Price might be temporarily unavailable
    product_url VARCHAR(2048) NULL,
    last_scraped_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE, -- If store deleted, remove its product links
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, -- If product deleted, remove its store links
    UNIQUE KEY unique_store_product (store_id, product_id) -- Can only link a product to a store once
);

-- Create shopping_lists table (Revised: removed is_one_time)
CREATE TABLE shopping_lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL, -- Link to users table (make NOT NULL later if required)
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    is_template BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE for templates, FALSE for regular lists
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- If user is deleted, delete their lists (adjust if different behavior needed)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create list_items table (links items to lists)
CREATE TABLE list_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shopping_list_id INT NOT NULL,
    product_id INT NOT NULL,
    department_grouping VARCHAR(100) NULL, -- User-defined grouping for THIS list
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1.0,
    units VARCHAR(50) NULL, -- Specific units for this list entry
    is_checked BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT NULL,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE, -- If list deleted, remove its items
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, -- If master product deleted, remove from lists
    UNIQUE KEY unique_list_item (shopping_list_id, product_id) -- Optional: Prevent adding same product twice
);

-- ------------------------------
-- --- EXPANDED Sample Data ---
-- ------------------------------

-- Sample Stores (Assume IDs 1, 2, 3, 4)
INSERT INTO stores (name, base_url) VALUES
    ('Local Supermarket', 'http://example-supermarket.com'), -- ID 1
    ('Online Mart', 'http://example-onlinemart.com'),       -- ID 2
    ('Discount Grocer', 'http://discount.example.com'),      -- ID 3
    ('Organic World', 'http://organic.example.com');        -- ID 4

-- Sample Products (Assume IDs 1, 2, 3, 4, 5, 6, 7, 8)
INSERT INTO products (name, manufacturer, canonical_department, default_units) VALUES
    ('Milk 1L', 'Tnuva', 'Dairy', 'Unit'),                 -- ID 1
    ('Bread Loaf', 'Angel Bakery', 'Bakery', 'Unit'),      -- ID 2
    ('Apples (Kg)', NULL, 'Produce', 'Kg'),                -- ID 3
    ('Laundry Detergent', 'Generic Brand', 'Household', 'Unit'), -- ID 4
    ('Yogurt multipack', 'Danone', 'Dairy', 'Pack'),       -- ID 5
    ('Cucumber (Kg)', NULL, 'Produce', 'Kg'),              -- ID 6
    ('Chocolate Bar', 'Elite', 'Snacks', 'Unit'),          -- ID 7
    ('Toothpaste', 'Colgate', 'Toiletries', 'Unit');      -- ID 8

-- Sample Users (Assume IDs 1, 2, 3, 4)
-- IMPORTANT: Replace 'hashed_password_placeholder_...' with actual bcrypt hashes in your app!
INSERT INTO users (email, password_hash, name, preferred_store_id) VALUES
    ('user1@example.com', '$2b$10$placeholderhashvalueforuser1', 'Alice', 1), -- Prefers Local Supermarket (ID 1)
    ('user2@example.com', '$2b$10$placeholderhashvalueforuser2', 'Bob', NULL),   -- No preference
    ('user3@example.com', '$2b$10$placeholderhashvalueforuser3', 'Charlie', 4), -- Prefers Organic World (ID 4)
    ('user4@example.com', '$2b$10$placeholderhashvalueforuser4', 'Diana', 2);   -- Prefers Online Mart (ID 2)

-- Sample Store Products (Linking products to stores with prices)
-- Assumes Store IDs: 1=Local, 2=Online, 3=Discount, 4=Organic
-- Assumes Product IDs: 1=Milk, 2=Bread, 3=Apples, 4=Detergent, 5=Yogurt, 6=Cucumber, 7=Chocolate, 8=Toothpaste
INSERT INTO store_products (store_id, product_id, current_price, product_url, last_scraped_at) VALUES
    -- Local Supermarket (ID 1)
    (1, 1, 5.50, 'http://example-supermarket.com/milk', NOW()),
    (1, 2, 8.00, 'http://example-supermarket.com/bread', NOW()),
    (1, 3, 9.90, 'http://example-supermarket.com/apples', NOW()),
    (1, 5, 15.00, 'http://example-supermarket.com/yogurt', NOW()),
    (1, 6, 4.50, 'http://example-supermarket.com/cucumbers', NOW()),
    (1, 7, 4.90, 'http://example-supermarket.com/chocolate', NOW()),
    -- Online Mart (ID 2)
    (2, 1, 5.80, 'http://example-onlinemart.com/milk', NOW()),
    (2, 3, 12.00, 'http://example-onlinemart.com/apples', NOW()),
    (2, 4, 25.00, 'http://example-onlinemart.com/detergent', NOW()),
    (2, 5, 16.50, 'http://example-onlinemart.com/yogurt6pack', NOW()),
    (2, 7, 5.20, 'http://example-onlinemart.com/choc', NOW()),
    (2, 8, 10.00, 'http://example-onlinemart.com/toothpaste', NOW()),
    -- Discount Grocer (ID 3)
    (3, 1, 5.40, 'http://discount.example.com/1', NOW()),
    (3, 2, 7.50, 'http://discount.example.com/2', NOW()),
    (3, 4, 22.50, 'http://discount.example.com/4', NOW()),
    (3, 6, 4.00, 'http://discount.example.com/6', NOW()),
    (3, 8, 9.00, 'http://discount.example.com/8', NOW()),
    -- Organic World (ID 4)
    (4, 1, 7.50, 'http://organic.example.com/milk', NOW()), -- Organic milk is pricey!
    (4, 3, 15.00, 'http://organic.example.com/apples', NOW()),
    (4, 5, 22.00, 'http://organic.example.com/yogurt', NOW()),
    (4, 6, 6.50, 'http://organic.example.com/cucumbers', NOW());

-- Sample Shopping Lists (Assume IDs 1, 2, 3, 4, 5, 6)
-- Assumes User IDs: 1=Alice, 2=Bob, 3=Charlie, 4=Diana
INSERT INTO shopping_lists (name, description, is_template, user_id) VALUES
    ('Alice Weekly', 'Standard groceries for the week', FALSE, 1),      -- ID 1 (Alice)
    ('BBQ Template', 'Stuff for weekend BBQ', TRUE, 1),                  -- ID 2 (Alice Template)
    ('Bob Quick Shop', 'A few items needed', FALSE, 2),                 -- ID 3 (Bob)
    ('Charlie Organic Run', 'Weekly organic needs', FALSE, 3),          -- ID 4 (Charlie)
    ('Diana Bulk Buy', 'Monthly stock-up', FALSE, 4),                  -- ID 5 (Diana)
    ('Snack Attack Template', 'Favorite snacks for movie night', TRUE, 2); -- ID 6 (Bob Template)

-- Sample List Items
-- Assumes List IDs: 1=Alice W., 2=BBQ T., 3=Bob Q., 4=Charlie O., 5=Diana B., 6=Snack T.
-- Assumes Product IDs: 1=Milk, 2=Bread, 3=Apples, 4=Detergent, 5=Yogurt, 6=Cucumber, 7=Chocolate, 8=Toothpaste
INSERT INTO list_items (shopping_list_id, product_id, department_grouping, quantity, units, is_checked, notes) VALUES
    -- Alice Weekly (List 1)
    (1, 1, 'Dairy & Fridge', 2, 'Unit', FALSE, 'Get the blue carton'),
    (1, 2, 'Bakery', 1, 'Unit', FALSE, NULL),
    (1, 3, 'Fruit & Veg', 1.5, 'Kg', FALSE, NULL),
    (1, 6, 'Fruit & Veg', 0.5, 'Kg', FALSE, 'Need 3-4 cucumbers'),
    -- BBQ Template (List 2) - Items that might be used when creating a new list from this template
    (2, 2, 'Food', 3, 'Pack', FALSE, 'Hamburger Buns (use Bread Loaf ID for now)'),
    (2, 4, 'Supplies', 1, 'Unit', FALSE, 'Check if needed'),
    (2, 7, 'Food', 5, 'Unit', FALSE, 'Dessert'),
    -- Bob Quick Shop (List 3)
    (3, 1, 'Fridge', 1, 'Unit', FALSE, NULL),
    (3, 4, 'Cleaning', 1, 'Unit', TRUE, 'Already bought this'),
    (3, 8, 'Bathroom', 1, 'Unit', FALSE, NULL),
    -- Charlie Organic Run (List 4)
    (4, 1, 'Dairy', 1, 'Unit', FALSE, NULL), -- Organic Milk (Prod ID 1)
    (4, 3, 'Produce', 2, 'Kg', FALSE, 'Organic Apples (Prod ID 3)'),
    (4, 6, 'Produce', 1, 'Kg', FALSE, 'Organic Cucumbers (Prod ID 6)'),
    -- Diana Bulk Buy (List 5)
    (5, 4, 'Household', 2, 'Unit', FALSE, 'Large size'),
    (5, 8, 'Toiletries', 4, 'Pack', FALSE, 'Multipack'),
    (5, 1, 'Dairy', 4, 'Unit', FALSE, NULL),
    -- Snack Attack Template (List 6)
    (6, 7, 'Snacks', 4, 'Unit', FALSE, NULL),
    (6, 5, 'Snacks', 1, 'Pack', FALSE, 'Yogurt multipack');
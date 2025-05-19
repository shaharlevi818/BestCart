// src/products/interface.ts

// General Product (matches your 'products' table structure)
export interface Product {
    id: number;
    name: string;
    description?: string | null;
    manufacturer?: string | null;
    canonical_department?: string | null; // Matches your DB column
    default_units?: string | null;      // Matches your DB column
    created_at: Date;
    updated_at: Date;
}

// For items as they appear in a shopping list
export interface ShoppingListProductView {
    product_id: number;                     // From products.id
    list_id: number;                        // From list_items.shopping_list_id
    name: string;                           // From products.name
    manufacturer?: string | null;           // From products.manufacturer
    department_display?: string | null;     // Chosen: list_items.department_grouping or products.canonical_department
    description?: string | null;            // From products.description
    notes?: string | null;                  // From list_items.notes
    quantity: number;                       // From list_items.quantity
    units_display?: string | null;          // Chosen: list_items.units or products.default_units
    is_checked: boolean;                    // From list_items.is_checked
    added_at: Date;                         // From list_items.added_at
    product_created_at: Date;               // From products.created_at
    product_updated_at: Date;               // From products.updated_at
    // Future: price?: number;
}

// Raw database row structure from the JOIN (useful for typing query results)
// This interface helps in typing the raw output from the SQL query before mapping
export interface RawShoppingListProductData {
    // Fields from 'products' table (aliased with p_ prefix)
    p_id: number;
    p_name: string;
    p_description?: string | null;
    p_manufacturer?: string | null;
    p_canonical_department?: string | null;
    p_default_units?: string | null;
    p_created_at: string | Date; // DB might return string
    p_updated_at: string | Date; // DB might return string

    // Fields from 'list_items' table (aliased with li_ prefix)
    li_shopping_list_id: number;
    li_department_grouping?: string | null;
    li_quantity: number; // Assuming this is not nullable in DB based on values like 2.00
    li_units?: string | null;
    li_is_checked: number | boolean; // DB might return 0/1 for boolean
    li_notes?: string | null;
    li_added_at: string | Date; // DB might return string

    // Future fields like price
    // price?: number;
}
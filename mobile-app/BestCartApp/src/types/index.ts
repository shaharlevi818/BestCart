// src/types/index.ts

// Represents a row from the 'shopping_lists' table.
export interface ShoppingList {
  id: number;
  user_id: number | null;
  name: string;
  description: string | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

// Represents a row from the canonical 'products' table.
export interface Product {
  id: number;
  name: string;
  description: string | null;
  manufacturer: string | null;
  canonical_department: string | null;
  default_units: string | null;
}

// Represents a row from the 'list_items' table, linking products to lists.
export interface ListItem {
  id: number;
  shopping_list_id: number;
  product_id: number;
  department_grouping: string | null;
  quantity: number;
  units: string | null;
  is_checked: boolean;
  notes: string | null;
}

// --- ADD THIS INTERFACE ---
// Represents the detailed data for an item on a list, as returned by the server.
export interface ShoppingListProductView {
    id: number; // The unique ID from the list_items table
    product_id: number;
    list_id: number;
    name: string;
    manufacturer: string | null;
    department_display: string | null;
    description: string | null;
    notes: string | null;
    quantity: number;
    units_display: string | null;
    is_checked: boolean;
    added_at: string;
    product_created_at: string;
    product_updated_at: string;
}

// A helper type used to display a list item within the app.
export interface DisplayListItem {
    id: number;
    shopping_list_id: number;
    product_id: number;
    productName: string;
    department: string;
    manufacturer: string | null;
    quantity: number;
    units: string | null;
    is_checked: boolean;
    notes: string | null;
}

// Represents a single item in the search results list.
export interface ProductSearchResult {
    id: number;
    name: string;
    manufacturer: string | null;
    displayPrice: string | null;
    priceSource: 'favorite_store' | 'average' | 'none';
    availability: {
      isAtFavoriteStore: boolean;
      otherStoreCount: number;
    };
}

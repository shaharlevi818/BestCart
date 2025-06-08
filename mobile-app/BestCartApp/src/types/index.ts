// src/types/index.ts
// This file defines TypeScript interfaces for the data structures used in the BestCartApp.


export interface Store {
  id: number;
  name: string;
  base_url: string | null;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
  preferred_store_id: number | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  manufacturer: string | null;
  canonical_department: string | null;
  default_units: string | null;
}

export interface ShoppingList {
  // ... (existing definition)
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

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

// A helper type for displaying list items with all their joined data
export interface DisplayListItem extends ListItem {
    productName: string;
    department: string; // The department to group by
}
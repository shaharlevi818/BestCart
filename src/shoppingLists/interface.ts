// src/shoppingLists/interface.ts


// Interface representing the core Shopping List data structure (maps closely to the DB table)
export interface ShoppingList {
    id: number;
    name: string;
    description: string | null; // Nullable if the DB column allows NULL
    is_template: boolean;      // Matches the DB column (consider isTemplate in code later if mapping)
    user_id: number | null;    // Nullable until auth is fully implemented and enforced
    created_at: Date | string; // Type might be Date if parsed, or string if raw from DB
    updated_at: Date | string;
  }
  
  // Interface representing a List Item data structure (maps closely to the DB table)
  export interface ListItem {
    id: number;
    shopping_list_id: number;
    product_id: number;
    department_grouping: string | null;
    quantity: number; // DB uses DECIMAL, ensure appropriate handling if needed
    units: string | null;
    is_checked: boolean;
    notes: string | null;
    added_at: Date | string;
  }

  export interface ListProduct {
    id: number;
    shopping_list_id: number;
    department_grouping: string | null;
    quantity: number;
    units: string | null;
  }
  
  // --- Data Transfer Objects (DTOs) for API Inputs ---
  // Often good practice to have separate types for API input vs. DB structure
  
  // Input data for creating a new shopping list (used in POST /api/lists body)
  export interface CreateListDto {
    name: string;              // Name is required
    description?: string;      // Optional description
    is_template?: boolean;     // Optional template flag
    // user_id is usually added by the server based on authentication, not passed in body
  }
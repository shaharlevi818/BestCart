import { ShoppingList, Product, ListItem } from '../types';

// Using 'let' so we can modify these during the app session for simulation
export let ALL_PRODUCTS: Product[] = [
    { id: 1, name: 'Milk 1L', description: null, manufacturer: 'Tnuva', canonical_department: 'Dairy', default_units: 'Unit' },
    { id: 2, name: 'Bread Loaf', description: null, manufacturer: 'Angel Bakery', canonical_department: 'Bakery', default_units: 'Unit' },
    { id: 3, name: 'Apples (Kg)', description: null, manufacturer: null, canonical_department: 'Produce', default_units: 'Kg' },
    { id: 4, name: 'Laundry Detergent', description: null, manufacturer: 'Generic Brand', canonical_department: 'Household', default_units: 'Unit' },
    { id: 5, name: 'Yogurt multipack', description: null, manufacturer: 'Danone', canonical_department: 'Dairy', default_units: 'Pack' },
    { id: 6, name: 'Cucumber (Kg)', description: null, manufacturer: null, canonical_department: 'Produce', default_units: 'Kg' },
    { id: 7, name: 'Chocolate Bar', description: null, manufacturer: 'Elite', canonical_department: 'Snacks', default_units: 'Unit' },
    { id: 8, name: 'Toothpaste', description: null, manufacturer: 'Colgate', canonical_department: 'Toiletries', default_units: 'Unit' },
];

export let ALL_SHOPPING_LISTS: ShoppingList[] = [
    { id: 1, user_id: 1, name: 'Alice Weekly', description: 'Standard groceries for the week', is_template: false, created_at: '2023-10-01T12:00:00Z', updated_at: '2023-10-02T12:00:00Z' },
    { id: 2, user_id: 1, name: 'BBQ Template', description: 'Stuff for weekend BBQ', is_template: true, created_at: '2023-10-01T12:00:00Z', updated_at: '2023-10-02T12:00:00Z' },
    { id: 3, user_id: 2, name: 'Bob Quick Shop', description: 'A few items needed', is_template: false, created_at: '2023-10-01T12:00:00Z', updated_at: '2023-10-02T12:00:00Z' },
    { id: 4, user_id: 3, name: 'Charlie Organic Run', description: 'Weekly organic needs', is_template: false, created_at: '2023-10-01T12:00:00Z', updated_at: '2023-10-02T12:00:00Z' },
    { id: 5, user_id: 4, name: 'Diana Bulk Buy', description: 'Monthly stock-up', is_template: false, created_at: '2023-10-01T12:00:00Z', updated_at: '2023-10-02T12:00:00Z' },
    { id: 6, user_id: 2, name: 'Snack Attack Template', description: 'Favorite snacks for movie night', is_template: true, created_at: '2023-10-01T12:00:00Z', updated_at: '2023-10-02T12:00:00Z' },
];

export let ALL_LIST_ITEMS: ListItem[] = [
    { id: 1, shopping_list_id: 1, product_id: 1, department_grouping: 'Dairy & Fridge', quantity: 2.00, units: 'Unit', is_checked: false, notes: 'Get the blue carton' },
    { id: 2, shopping_list_id: 1, product_id: 2, department_grouping: 'Bakery', quantity: 1.00, units: 'Unit', is_checked: false, notes: null },
    { id: 3, shopping_list_id: 1, product_id: 3, department_grouping: 'Fruit & Veg', quantity: 1.50, units: 'Kg', is_checked: false, notes: null },
    { id: 4, shopping_list_id: 1, product_id: 6, department_grouping: 'Fruit & Veg', quantity: 0.50, units: 'Kg', is_checked: false, notes: 'Need 3-4 cucumbers' },
    { id: 9, shopping_list_id: 3, product_id: 4, department_grouping: 'Cleaning', quantity: 1.00, units: 'Unit', is_checked: true, notes: 'Already bought this' },
    { id: 8, shopping_list_id: 3, product_id: 1, department_grouping: 'Fridge', quantity: 1.00, units: 'Unit', is_checked: false, notes: null },
];

// Helper function to add a new list
export const addListToDB = (newList: ShoppingList) => {
    ALL_SHOPPING_LISTS.push(newList);
};
// src/products/service.ts

import pool from '../config/database'; // Assuming db is in src/config/
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'; // Import specific types from mysql2
import shoppingListService from '../shoppingLists/service';
import userService from '../users/service';

// <<< Import the interfaces
import {
    ShoppingList,
    CreateListDto,
} from '../shoppingLists/interface'; 

import {
    Product,
    ShoppingListProductView,
    RawShoppingListProductData
} from '../products/interface';




// --- Helper Functions (can be static members of the class or standalone) ---
const parseDate = (dateInput: string | Date | null | undefined): Date => {
    if (dateInput instanceof Date) return dateInput;
    // Consider more robust error handling for invalid date strings
    if (!dateInput) {
        // Decide: throw error, return a default, or return null (if field is nullable)
        // For non-nullable Date fields, throwing or using a sensible default might be better.
        // For now, defaulting to current date if input is null/undefined for required Date fields.
        console.warn('parseDate received null or undefined input, returning current date.');
        return new Date();
    }
    return new Date(dateInput);
};

const parseBoolean = (boolInput: number | boolean | null | undefined): boolean => {
    if (typeof boolInput === 'boolean') return boolInput;
    return boolInput === 1; // Common for MySQL TINYINT(1) being 0 or 1
};

export interface GetProductsForListOptions {
    includePrice?: boolean;
    storeId?: number; // For store-specific pricing
    // Add other future options here
}

// --- Service Class ---
class ProductService {

    /**
     * Fetches and combines product data with list-specific item details for a given shopping list.
     * Designed to be reusable for fetching prices or other related data in the future.
     * @param listId The ID of the shopping list.
     * @param options Options object for future enhancements (e.g., including price).
     * @returns Array of ShoppingListItemView objects.
     */
    async getProductsDetailsForList( listId: number, options: GetProductsForListOptions = {}): Promise<ShoppingListProductView[]> {
        const { includePrice, storeId } = options;

        // --- SQL Query Construction ---
        let selectClause = `
            p.id AS p_id,
            p.name AS p_name,
            p.description AS p_description,
            p.manufacturer AS p_manufacturer,
            p.canonical_department AS p_canonical_department,
            p.default_units AS p_default_units,
            p.created_at AS p_created_at,
            p.updated_at AS p_updated_at,
            li.shopping_list_id AS li_shopping_list_id,
            li.department_grouping AS li_department_grouping,
            li.quantity AS li_quantity,
            li.units AS li_units,
            li.is_checked AS li_is_checked,
            li.notes AS li_notes,
            li.added_at AS li_added_at
        `;

        let joinClause = `
            FROM list_items li
            INNER JOIN products p ON li.product_id = p.id
        `; // Ensure 'products.id' and 'list_items.product_id' are the correct join keys

        const queryParams: (number | string)[] = []; // For parameterized query

        if (includePrice) {
            // This section is for future price fetching.
            // You'll need a 'product_prices' table (or similar).
            selectClause += `, pr.price AS price`; // Assuming 'price' column in product_prices
            joinClause += ` LEFT JOIN product_prices pr ON p.id = pr.product_id`; // Adjust join condition
            if (storeId) {
                joinClause += ` AND pr.store_id = ?`; // If prices are store-specific
                queryParams.push(storeId);
            } else {
                // Handle if prices are needed but no storeId (e.g., default store, average price)
                // joinClause += ` AND pr.is_default_store = 1`; // Example
            }
        }
        queryParams.push(listId); // listId for the WHERE clause (li.shopping_list_id = ?)

        const sql = `
            SELECT ${selectClause}
            ${joinClause}
            WHERE li.shopping_list_id = ? 
            ORDER BY li.added_at ASC; 
        `;
        // Note on queryParams order: if storeId is used, it's added first, then listId.
        // The '?' in `WHERE li.shopping_list_id = ?` corresponds to the *last* element pushed to queryParams
        // if it's the only dynamic part of the WHERE. If storeId is also in a WHERE/AND, adjust.
        // Corrected: The '?' for shopping_list_id will map to the listId parameter that was pushed last.

        try {
            const [rows] = await pool.query<RawShoppingListProductData[] & RowDataPacket[]>(sql, queryParams);

            if (!rows) { // Should not happen with pool.query returning [rows, fields] but good for safety
                return [];
            }

            return rows.map(row => {
                // Logic to decide which department and units to use for display
                const department_display = row.li_department_grouping || row.p_canonical_department || null;
                const units_display = row.li_units || row.p_default_units || null;

                // Safely access properties, providing defaults or nulls
                const mappedItem: ShoppingListProductView = {
                    product_id: row.p_id,
                    list_id: row.li_shopping_list_id,
                    name: row.p_name || 'Unknown Product', // Fallback for name
                    manufacturer: row.p_manufacturer || null,
                    department_display: department_display,
                    description: row.p_description || null,
                    notes: row.li_notes || null,
                    quantity: row.li_quantity !== null && row.li_quantity !== undefined ? Number(row.li_quantity) : 1, // Default quantity
                    units_display: units_display,
                    is_checked: parseBoolean(row.li_is_checked),
                    added_at: parseDate(row.li_added_at),
                    product_created_at: parseDate(row.p_created_at),
                    product_updated_at: parseDate(row.p_updated_at),
                    // price: includePrice && row.price !== undefined ? Number(row.price) : undefined, // Example price mapping
                };
                return mappedItem;
            });
        } catch (error) {
            console.error(`ProductService: Error fetching product details for list ${listId}:`, error);
            // Consider throwing a more specific custom error or re-throwing
            throw new Error('Database error while fetching product details for the list.');
        }
    }

    // You can add other product-related methods here, e.g.:
    // async getProductById(productId: number): Promise<Product | null> { ... }
    // async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> { ... }
    // async updateProduct(productId: number, productData: Partial<Product>): Promise<Product | null> { ... }
    // async deleteProduct(productId: number): Promise<boolean> { ... }

}

export default new ProductService();

// async getProductsByListId(userId: number, listId: number): Promise<ListProduct[] | null> {
    //     console.log('DEBUG: SERVICE: getProductsOfAList.');
    //     //add validation
    //     try {
    //         const ProductsInList = this.getProductsIds(userId, listId);
    //         const ProductsInListByNames = this.getProductsName(ProductsInList);
    //         console.log()
    //         return ProductsInListByNames as ListProduct[];
    //     } catch (error: any) {
    //         console.error(`Service Error fetching list's products`, error);
    //         throw new Error('Could not retrieve shopping lists content.');
    //     }
    // }

    // async getProductsIds(userId: number, listId: number):Promise<number[] | null> {
    //     console.log('DEBUG: Service: getProductsIds.');
    //     const sql = `SELECT * FROM lists_items WHERE shopping_list_id = ?`;
    //     try {
    //         const [[products]] = await pool.query<RowDataPacket[]>(sql, [listId]);
    //         console.log(`SERVICE: fetching products' Ids`);
    //         return products as any;
    //     } catch (error: any) {
    //         console.error(`Service Error fetching product's ids.`, error);
    //         throw new Error(`Could not fetch products ids.`);  
    //     }
    // }

    // async getProductsName(productsIds: number[]):Promise<ListProduct[] | null> {
    //     console.log('DEBUG: Service: getProductsName.');
    //     const sql = `SELECT * FROM products WHERE id = ?`;
    //     try {
    //         const productsNames = await pool.query(sql, [productsIds]);
    //         console.log(`SERVICE: fetching products' names`);
    //         return productsNames as ListProduct[];
    //     } catch (error: any) {
    //         console.error(`Service Error fetching products names`, error);
    //         throw new Error('Could not retrieve products names.'); 
    //     }
    // }

    // async getListProductsByListId(ListProductsByIDs: RowDataPacket[]): Promise<ListItem[]> {
    //         console.log('debug -> inside getProductsFromIDs');
    //         try {
    //             const [listOfProducts] = await pool.query<RowDataPacket[]>(
    //                 'SELECT * FROM products WHERE id = ?',
    //                 [ListProductsByIDs]
    //             );
    //             return listOfProducts as ListItem[];
    //         }catch (error) {
    //             console.error(`Service Error getProductsFromIDs`, error);
    //             throw new Error(`Could not getProductsFromIDs`);
    //         }
    // }




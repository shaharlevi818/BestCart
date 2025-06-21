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
    RawShoppingListProductData,
    ProductSearchResult
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
        li.added_at AS li_added_at,
        li.id AS li_id -- <<< FIX 1: Added this line to select the list item's unique ID
    `;

    let joinClause = `
        FROM list_items li
        INNER JOIN products p ON li.product_id = p.id
    `; 

    const queryParams: (number | string)[] = [];

    if (includePrice) {
        // Your future pricing logic here...
    }
    
    queryParams.push(listId); 

    const sql = `
        SELECT ${selectClause}
        ${joinClause}
        WHERE li.shopping_list_id = ? 
        ORDER BY p.canonical_department ASC, p.name ASC; 
    `;

    try {
        const [rows] = await pool.query<RawShoppingListProductData[] & RowDataPacket[]>(sql, queryParams);

        if (!rows) {
            return [];
        }

        return rows.map(row => {
            const department_display = row.li_department_grouping || row.p_canonical_department || 'Other';
            const units_display = row.li_units || row.p_default_units || 'Unit';

            const mappedItem: ShoppingListProductView = {
                id: row.li_id, // <<< FIX 2: Added the list item ID to the final object
                product_id: row.p_id,
                list_id: row.li_shopping_list_id,
                name: row.p_name || 'Unknown Product',
                manufacturer: row.p_manufacturer || null,
                department_display: department_display,
                description: row.p_description || null,
                notes: row.li_notes || null,
                quantity: row.li_quantity !== null && row.li_quantity !== undefined ? Number(row.li_quantity) : 1,
                units_display: units_display,
                is_checked: parseBoolean(row.li_is_checked),
                added_at: parseDate(row.li_added_at),
                product_created_at: parseDate(row.p_created_at),
                product_updated_at: parseDate(row.p_updated_at),
            };
            return mappedItem;
        });
    } catch (error) {
        console.error(`ProductService: Error fetching product details for list ${listId}:`, error);
        throw new Error('Database error while fetching product details for the list.');
    }
}
    /**
     * Fetches a single canonical product by its ID.
     * @param productId The ID of the product to fetch.
     * @returns A promise that resolves to a Product object or null if not found.
     */
    async getProductById(productId: number): Promise<Product | null> {
        console.log(`SERVICE: Getting product with ID ${productId}`);
        const sql = 'SELECT * FROM products WHERE id = ?;';
        try {
            const [rows] = await pool.query<RowDataPacket[]>(sql, [productId]);
            if (rows.length === 0) {
                console.log(`SERVICE: Product with ID ${productId} not found.`);
                return null;
            }
            return rows[0] as Product;
        } catch (error) {
            console.error(`SERVICE: Error fetching product ${productId}:`, error);
            throw new Error('Database error while fetching product.');
        }
    }

    /**
     * Searches for products and aggregates pricing and availability info.
     * @param searchQuery The user's search term.
     * @param userId The ID of the current user.
     * @returns A promise that resolves to an array of search results.
     */
    async searchProducts(searchQuery: string, userId: number): Promise<ProductSearchResult[]> {
        console.log(`SERVICE: Searching for products with query "${searchQuery}" for user ${userId}`);

        // 1. Get the user's preferred store ID first
        const userSql = 'SELECT preferred_store_id FROM users WHERE id = ?;';
        const [userRows] = await pool.query<RowDataPacket[]>(userSql, [userId]);
        const preferredStoreId = userRows.length > 0 ? userRows[0].preferred_store_id : null;
        
        // 2. Search for matching products in the main products table
        const productSql = 'SELECT id, name, manufacturer FROM products WHERE name LIKE ? LIMIT 20;'; // Limit results
        const [products] = await pool.query<Product[] & RowDataPacket[]>(productSql, [`%${searchQuery}%`]);

        if (products.length === 0) {
            return []; // No products found, return empty array
        }

        // 3. For each found product, get all its pricing info
        const results = await Promise.all(products.map(async (product) => {
            
            const pricesSql = 'SELECT store_id, current_price FROM store_products WHERE product_id = ?;';
            const [priceRows] = await pool.query<RowDataPacket[]>(pricesSql, [product.id]);

            let displayPrice: string | null = null;
            let priceSource: 'favorite_store' | 'average' | 'none' = 'none';
            let isAtFavoriteStore = false;
            let otherStoreCount = 0;

            if (priceRows.length > 0) {
                // Check for favorite store price
                const favoriteStorePriceRow = preferredStoreId 
                    ? priceRows.find(p => p.store_id === preferredStoreId) 
                    : null;

                if (favoriteStorePriceRow && favoriteStorePriceRow.current_price) {
                    displayPrice = parseFloat(favoriteStorePriceRow.current_price).toFixed(2);
                    priceSource = 'favorite_store';
                    isAtFavoriteStore = true;
                    otherStoreCount = priceRows.filter(p => p.store_id !== preferredStoreId).length;
                } else {
                    // If no favorite price, calculate average
                    const validPrices = priceRows.map(p => parseFloat(p.current_price)).filter(p => !isNaN(p));
                    if (validPrices.length > 0) {
                        const sum = validPrices.reduce((a, b) => a + b, 0);
                        displayPrice = (sum / validPrices.length).toFixed(2);
                        priceSource = 'average';
                    }
                    otherStoreCount = priceRows.length;
                }
            }
            
            // Construct the final search result object
            const searchResult: ProductSearchResult = {
                id: product.id,
                name: product.name,
                manufacturer: product.manufacturer || null,
                displayPrice,
                priceSource,
                availability: {
                    isAtFavoriteStore,
                    otherStoreCount
                }
            };
            
            return searchResult;
        }));

        return results;
    }
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




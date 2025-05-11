// src/shoppingLists/router.ts

import express from 'express'; // Removed unused Request, Response, Router imports for this snippet
import shoppingListService from '../shoppingLists/service';
import productService from '../products/service';
import userService from '../users/service';
// <<< Import the middleware and schema
import { validateRequest } from '../middleware/validateRequest';
import { createListSchema, getListByListIdSchema } from '../shoppingLists/schemas';
import { ShoppingList } from './interface';

const router = express.Router(); // Re-add Router if needed elsewhere

// --- Other routes (like GET) stay the same ---
router.get('/',
    async (req, res) => {
        const userId = 1;       //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! placeholder!
        console.log(`ROUTE: GET /api/shoppingList hit for user ${userId}`);
        try {
            const userShoppingLists = await shoppingListService.getAllListsForUser(userId);
            res.status(200).json(userShoppingLists);
        } catch (error: any) {
            console.error(`ROUTE Error fetching lists for user ${userId}:`, error.message);
            res.status(500).json({message: `Error fetching shopping list for user: ${userId}`});
        }
    }
);


// --- getting list info ---
// function Inouts: user_id, list_id
router.get(
    '/:listId',
    //validateRequest(getListByListIdSchema),
    async (req, res) => {
        const userId = 1; // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! placeholder
        const listToGetData = req.body
        const listId = listToGetData.id
        
        console.log(`DEBUG: Route GET :listId -> list data = ${listId}.`);
        console.log(`ROUTE: /api/shoppinglist/:listId validated.`);

        try {
            const listData = await shoppingListService.getListByListId(userId, listId);
            res.status(200).json({
                message: `Wanted list fecthed successfully.`,
                data: {
                    "User Id": userId,
                    "List Id": listId,
                    "Name": listData?.name,
                    "Description": listData?.description,
                    "is template": listData?.is_template,
                    "created at": listData?.created_at,
                    "updated at": listData?.updated_at
                }
            });
        } catch (error: any) {
            console.error(`Route error fetching shopping list: ${listId}`, error.message);
            res.status(500).json({ message: `Route error fetching list ${listId}` });
        }
    }
);


router.get(
    '/:listId/products',
    //Add validation
    async (req, res) => {
        const userId = 1; // Placeholder - replace with actual user ID from auth later
        const listId = req.body.id;
        console.log(`ROUTE: GET /api/shoppinglist/:listId/products validated, list Id = ${listId}.`);
        try {
            // 1. Optionally, verify the list itself exists
            const list = await shoppingListService.getListByListId(userId, listId); // Assuming userId 0 or from auth
            if (!list) {
                return res.status(404).json({ message: `Shopping list with ID ${listId} not found.` });
            }

            // TODO: Authorization check: Does the authenticated user own this list?

            // 2. Fetch combined product details for the list
            // For now, we don't need prices, so we pass default options or an empty object
            const productsWithDetails = await productService.getProductsDetailsForList(listId, {});
            // Example for future use with prices for a specific store:
            // const productsWithDetails = await productService.getProductsDetailsForList(listId, { includePrice: true, storeId: 123 });


            res.status(200).json({
                message: `Products for list ${listId} fetched successfully.`,
                listId: listId,
                listName: list.name, // From the shoppingListService.getListById call
                count: productsWithDetails.length,
                data: productsWithDetails,
            });

        } catch (error: any) {
            console.error(`Error in GET /${listId}/products:`, error);
            res.status(500).json({ message: error.message || 'Server error while retrieving products for the list.' });
        }
    }
);



// --- Apply validation to POST route ---
//function returns new Id of the new list.
router.post(
    '/',
    validateRequest(createListSchema), // <<< Apply validation middleware HERE
    // This async handler only runs if validateRequest calls next()
    async (req, res) => {
        // If code reaches here, req.body is validated according to createListSchema.body
        const userId = 1; // Placeholder - replace with actual user ID from auth later
        const listData = req.body;
        console.log(`ROUTE: POST /api/shoppinglist validated. Data: ${listData}.`);
        
        try {
            const newListId = await shoppingListService.createList(listData, userId);
            res.status(201).json({ message: `List created successfully, listId: ${newListId}` });
        } catch (error: any) {
            console.error(`Route Error creating shopping list:`, error.message);
            res.status(500).json({ message: `Error creating list` });
        }
    }
);

export default router;









/*

import pool from '../config/database'; // <<< IMPORT THE POOL

const router: Router = express.Router();


// POST /lists - create new list (Example structure - needs implementation)
router.post('/', async (req: Request, res: Response) => { // <<< Add async
    // ** Add validation for req.body **
    const { name, description, is_one_time, is_template, user_id } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'List name is required' });
    }
    try {
        // Logic to create new list in the database
        const sql = 'INSERT INTO shopping_lists (name, description, is_one_time, is_template, user_id) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [name, description || null, is_one_time || false, is_template || false, user_id || null]);
        const insertId = (result as any).insertId;
        res.status(201).json({ message: 'Create a new list', listId: insertId });
    } catch (error: any) {
        console.error("Error creating shopping list:", error.message);
        res.status(500).json({ message: 'Error creating list' });
    }
});

// GET /lists/count - Get the number of lists (Example structure - needs implementation)
router.get('/count', async (req: Request, res: Response) => { // <<< Add async
    try {
         // Logic to get the number of lists from the database
        const [rows] = await pool.query('SELECT COUNT(*) as listCount FROM shopping_lists');
        // rows[0] might look like { listCount: 5 }
        const count = (rows as any[])[0]?.listCount || 0;
        res.status(200).json({ listCount: count });
    } catch (error: any) {
         console.error("Error counting shopping lists:", error.message);
         res.status(500).json({ message: 'Error counting lists' });
    }
});

// DELETE /lists/{listId} - Delete a list (Example structure - needs implementation)
router.delete('/:listId', async (req: Request, res: Response) => { // <<< Add async
    const listId = req.params.listId;
    // ** Add validation for listId **
    if (!listId || isNaN(Number(listId))) {
         return res.status(400).json({ message: 'Invalid list ID' });
    }
    try {
        // Logic to delete the list with listId from the database
        const [result] = await pool.query('DELETE FROM shopping_lists WHERE id = ?', [listId]);
        const affectedRows = (result as any).affectedRows;
        if (affectedRows > 0) {
             res.status(200).json({ message: `Deleted list ${listId}` });
        } else {
             res.status(404).json({ message: `List ${listId} not found` });
        }
    } catch (error: any) {
        console.error("Error deleting shopping list:", error.message);
        res.status(500).json({ message: 'Error deleting list' });
    }
});

export default router;

*/
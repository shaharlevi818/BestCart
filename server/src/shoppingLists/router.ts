import express from 'express';
import shoppingListService from './service';
import productService from '../products/service';
// ... other imports
import { validateRequest } from '../middleware/validateRequest';
import { createListSchema } from './schemas';

const router = express.Router();

// GET all of a user's lists
router.get('/', async (req, res) => {
    const userId = 1; // Placeholder
    console.log(`ROUTE: GET /api/shopping-lists hit for user ${userId}`);
    try {
        const userShoppingLists = await shoppingListService.getAllListsForUser(userId);
        res.status(200).json(userShoppingLists);
    } catch (error: any) {
        console.error(`ROUTE Error fetching lists for user ${userId}:`, error.message);
        res.status(500).json({ message: `Error fetching shopping lists for user: ${userId}` });
    }
});

// GET a specific list by its ID
router.get('/:listId', async (req, res) => {
    const userId = 1; // Placeholder
    // --- FIX: Read listId from req.params, not req.body ---
    const listId = parseInt(req.params.listId, 10); 

    if (isNaN(listId)) {
        return res.status(400).json({ message: 'Invalid list ID.' });
    }

    console.log(`ROUTE: GET /api/shopping-lists/:listId hit for listId ${listId}.`);

    try {
        const listData = await shoppingListService.getListByListId(userId, listId);
        if (!listData) {
            return res.status(404).json({ message: `List with ID ${listId} not found or does not belong to user.` });
        }
        res.status(200).json(listData);
    } catch (error: any) {
        console.error(`Route error fetching shopping list ${listId}:`, error.message);
        res.status(500).json({ message: `Route error fetching list ${listId}` });
    }
});


// POST /api/shopping-lists/:listId/items - Adds a product to a list
router.post('/:listId/items', async (req, res) => {
    const userId = 1; // Placeholder for authenticated user
    const listId = parseInt(req.params.listId, 10);
    const { productId } = req.body; // Expect productId in the request body

    if (isNaN(listId) || !productId || isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid list ID or product ID.' });
    }

    try {
        const newItem = await shoppingListService.addItemToList(listId, productId, userId);
        res.status(201).json({ message: 'Item added successfully', data: newItem });
    } catch (error: any) {
        console.error(`Route Error adding item to list ${listId}:`, error.message);
        if (error.message.includes('permission denied')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error adding item to list' });
    }
});


// GET all products for a specific list
router.get('/:listId/products', async (req, res) => {
    const userId = 1; // Placeholder
    // --- FIX: Read listId from req.params ---
    const listId = parseInt(req.params.listId, 10);

    if (isNaN(listId)) {
        return res.status(400).json({ message: 'Invalid list ID.' });
    }

    console.log(`ROUTE: GET /api/shopping-lists/:listId/products hit for list Id = ${listId}.`);
    try {
        const list = await shoppingListService.getListByListId(userId, listId);
        if (!list) {
            return res.status(404).json({ message: `Shopping list with ID ${listId} not found.` });
        }

        const productsWithDetails = await productService.getProductsDetailsForList(listId);
        res.status(200).json({
            message: `Products for list ${listId} fetched successfully.`,
            listId: listId,
            listName: list.name,
            count: productsWithDetails.length,
            data: productsWithDetails,
        });

    } catch (error: any) {
        console.error(`Error in GET /${listId}/products:`, error);
        res.status(500).json({ message: 'Server error while retrieving products for the list.' });
    }
});

// POST a new list
router.post('/', validateRequest(createListSchema), async (req, res) => {
    const userId = 1; // Placeholder
    const listData: { name: string; description?: string; is_template?: boolean } = req.body;
    console.log(`ROUTE: POST /api/shopping-lists validated.`);
    
    try {
        const newList = await shoppingListService.createList(listData, userId);
        res.status(201).json({ message: `List created successfully`, data: newList });
    } catch (error: any) {
        console.error(`Route Error creating shopping list:`, error.message);
        res.status(500).json({ message: `Error creating list` });
    }
});

router.delete('/:listId', async (req, res) => {
    const userId = 1; // Placeholder
    const listId = parseInt(req.params.listId, 10);
    if (isNaN(listId)) {
        return res.status(400).json({ message: 'Invalid list ID.' });
    }
    console.log(`ROUTE: DELETE /api/shopping-lists/:listId hit for listId ${listId}.`);
    try {
        const deletedCount = await shoppingListService.deleteListById(userId, listId);
        if (deletedCount === 0) {
            return res.status(404).json({ message: `List with ID ${listId} not found or does not belong to user.` });
        }
        res.status(200).json({ message: `List with ID ${listId} deleted successfully.` });
    } catch (error: any) {
        console.error(`Route Error deleting shopping list ${listId}:`, error.message);
        res.status(500).json({ message: `Error deleting list ${listId}` });
    }
});
// Add this PUT route to your router file

router.put('/:listId', async (req, res) => {
    const userId = 1; // Placeholder
    const listId = parseInt(req.params.listId, 10);
    const listData = req.body;

    if (isNaN(listId)) {
        return res.status(400).json({ message: 'Invalid list ID.' });
    }
    // Note: You should create a schema for updates as well!
    // For now, we'll proceed without one for simplicity.

    try {
        const updatedList = await shoppingListService.updateList(listId, listData, userId);
        if (!updatedList) {
            return res.status(404).json({ message: `List with ID ${listId} not found or you do not have permission to edit it.` });
        }
        res.status(200).json({ message: 'List updated successfully', data: updatedList });
    } catch (error: any) {
        console.error(`Route Error updating list ${listId}:`, error.message);
        res.status(500).json({ message: 'Error updating list' });
    }
});

router.post('/:listId/products', async (req, res) => {
    const userId = 1; // Placeholder for authenticated user
    const listId = parseInt(req.params.listId, 10);
    const { productId } = req.body; // Expect productId in the request body

    if (isNaN(listId) || !productId || isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid list ID or product ID.' });
    }

    try {
        const list = await shoppingListService.getListByListId(userId, listId);
        if (!list) {
            return res.status(404).json({ message: `Shopping list with ID ${listId} not found.` });
        }

        const productsWithDetails = await productService.getProductsDetailsForList(listId);
        res.status(200).json({
            message: `Products for list ${listId} fetched successfully.`,
            listId: listId,
            listName: list.name,
            count: productsWithDetails.length,
            data: productsWithDetails,
        });
    } catch (error: any) {
        console.error(`Error in GET /${listId}/products:`, error);
        res.status(500).json({ message: 'Server error while retrieving products for the list.' });
    }
});

export default router;
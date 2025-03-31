import express, { Request, Response } from 'express';

const router = express.Router();

// GET /items - get all items
router.get('/', (req: Request, res: Response) => {
    //Logic to retrieve all items from data base
    //..
    res.json({ message: 'Get all items'});  // placeholder response
});

// POST /items - create new item
router.post('/', (req: Request, res: Response) => {
    //logic to create new item in the data base
    //..
    res.json({message: 'Create a new item'});   // placeholder response
});

// GET /items/count - Get the number of items
router.get('/count', (req: Request, res: Response) => {
    // Logic to get the number of items from the database
    // ...
    res.json({ message: 'Get the number of items' });   // Placeholder response
});

// DELETE /items/{itemId} - Delete a item
router.delete('/:itemId', (req: Request, res: Response) => {
    const itemId = req.params.itemId;
    // Logic to delete the item with itemId from the database
    // ...
    res.json({ message: `Delete item ${itemId}` }); // Placeholder response
});

export default router;
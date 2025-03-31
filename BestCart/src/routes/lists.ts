import express, { Request, Response } from 'express';

const router = express.Router();

// GET /lists - get all lists
router.get('/', (req: Request, res: Response) => {
    //Logic to retrieve all lists from data base
    //..
    res.json({ message: 'Get all lists'});  // placeholder response
});

// POST /lists - create new list
router.post('/', (req: Request, res: Response) => {
    //logic to create new list in the data base
    //..
    res.json({message: 'Create a new list'});   // placeholder response
});

// GET /lists/count - Get the number of lists
router.get('/count', (req: Request, res: Response) => {
    // Logic to get the number of lists from the database
    // ...
    res.json({ message: 'Get the number of lists' });   // Placeholder response
});

// DELETE /lists/{listId} - Delete a list
router.delete('/:listId', (req: Request, res: Response) => {
    const listId = req.params.listId;
    // Logic to delete the list with listId from the database
    // ...
    res.json({ message: `Delete list ${listId}` }); // Placeholder response
});

export default router;



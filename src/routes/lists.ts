// src/routes/lists.ts
import express, { Request, Response, Router } from 'express';
import pool from '../database'; // <<< IMPORT THE POOL

const router: Router = express.Router();

// GET /lists - get all lists
router.get('/', async (req: Request, res: Response) => { // <<< Add async
    console.log('Received request for GET /api/lists'); // Keep logs for debugging
    try {
        // Logic to retrieve all lists from database
        const [rows] = await pool.query('SELECT * FROM shopping_lists ORDER BY created_at DESC'); // <<< Use await pool.query
        console.log(`Workspaceed ${Array.isArray(rows) ? rows.length : 0} lists from DB.`);
        res.status(200).json(rows); // <<< Send actual data
    } catch (error: any) {
        console.error("Error fetching shopping lists:", error.message);
        res.status(500).json({ message: 'Error fetching lists' });
    }
});

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

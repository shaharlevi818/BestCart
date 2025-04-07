// src/routes/listsManager.ts
import express, { Request, Response, Router } from 'express';
import pool from '../database'; // Import the database pool

const router: Router = express.Router();

// Example: GET /api/listsManager/summary - Get names and IDs of all lists
router.get('/summary', async (req: Request, res: Response) => {
    console.log('Received request for GET /api/listsManager/summary');
    try {
        const [rows] = await pool.query('SELECT id, name FROM shopping_lists ORDER BY name ASC');
        console.log(`Workspaceed summary for ${Array.isArray(rows) ? rows.length : 0} lists.`);
        res.status(200).json(rows);
    } catch (error: any) {
        console.error('Error fetching list summary:', error.message);
        res.status(500).json({ message: 'Error fetching list summary' });
    }
});

// Other potential routes for managing lists might go here
// e.g., POST /combine, GET /favorites, etc.
// These would contain specific application logic.

export default router;
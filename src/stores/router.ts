// src/stores/router.ts
import express, { Request, Response, Router } from 'express';
import pool from '../config/database'; // Import the database pool

const router: Router = express.Router();

// GET /api/stores - Fetch all stores
router.get('/', async (req: Request, res: Response) => {
    console.log('Received request for GET /api/stores');
    try {
        const [rows] = await pool.query('SELECT * FROM stores ORDER BY name ASC');
        console.log(`Workspaceed ${Array.isArray(rows) ? rows.length : 0} stores from DB.`);
        res.status(200).json(rows);
    } catch (error: any) {
        console.error('Error fetching stores:', error.message);
        res.status(500).json({ message: 'Error fetching stores' });
    }
});

// POST /api/stores - Add a new store
router.post('/', async (req: Request, res: Response) => {
     // ** Add validation for req.body **
    const { name, base_url } = req.body;
     if (!name) {
        return res.status(400).json({ message: 'Store name is required' });
    }
    console.log('Received request for POST /api/stores with name:', name);
    try {
        const sql = 'INSERT INTO stores (name, base_url) VALUES (?, ?)';
        const [result] = await pool.query(sql, [name, base_url || null]);
        const insertId = (result as any).insertId;
        console.log(`Created store with ID ${insertId}.`);
        res.status(201).json({ message: 'Store created successfully', storeId: insertId });
    } catch (error: any) {
        console.error('Error creating store:', error.message);
         // Handle potential duplicate name error (UNIQUE constraint)
         if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'Store name already exists' });
         }
        res.status(500).json({ message: 'Error creating store' });
    }
});

// Add GET by ID, PUT, DELETE routes similarly...

export default router;
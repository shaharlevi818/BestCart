// src/routes/departments.ts
import express, { Request, Response, Router } from 'express';
import pool from '../database'; // Import the database pool

const router: Router = express.Router();

// GET /api/departments - Fetch distinct canonical department names from products
router.get('/', async (req: Request, res: Response) => {
    console.log('Received request for GET /api/departments');
    try {
        // Selects unique non-null department names
        const [rows] = await pool.query(
            'SELECT DISTINCT canonical_department FROM products WHERE canonical_department IS NOT NULL ORDER BY canonical_department ASC'
        );
        // rows will be like [ { canonical_department: 'Bakery' }, { canonical_department: 'Dairy' }, ... ]
        const departments = (rows as any[]).map(row => row.canonical_department);
         console.log(`Workspaceed ${departments.length} distinct departments.`);
        res.status(200).json(departments); // Send back an array of strings
    } catch (error: any) {
        console.error('Error fetching departments:', error.message);
        res.status(500).json({ message: 'Error fetching departments' });
    }
});

// POST, PUT, DELETE might not make sense here unless you change the schema

export default router;
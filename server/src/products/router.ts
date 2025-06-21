// src/products/router.ts

import express, { Request, Response, Router } from 'express';
import pool from '../config/database'; // Import the database pool
import ProductService from './service'; // Import the Product interface
const router: Router = express.Router();

// GET /api/items - Fetch all canonical products
router.get('/', async (req: Request, res: Response) => {
    console.log('Received request for GET /api/items');
    try {
        const [rows] = await pool.query('SELECT * FROM products ORDER BY name ASC');
        console.log(`Workspaceed ${Array.isArray(rows) ? rows.length : 0} products from DB.`);
        res.status(200).json(rows);
    } catch (error: any) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// GET /api/products/search?q=...&userId=...
router.get('/search', async (req: Request, res: Response) => {
    // 1. Validate query parameters
    const { q, userId } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
        return res.status(400).json({ message: 'A search query "q" is required.' });
    }

    if (!userId || isNaN(Number(userId))) {
        return res.status(400).json({ message: 'A valid "userId" is required.' });
    }
    
    console.log(`Received request for GET /api/products/search with query: "${q}"`);
    
    try {
        // 2. Call the new service method
        const searchResults = await ProductService.searchProducts(q, Number(userId));
        
        // 3. Send back the results
        res.status(200).json(searchResults);

    } catch (error: any) {
        console.error('Error in product search route:', error.message);
        res.status(500).json({ message: 'Error searching for products' });
    }
});

// GET /api/items/:id - Fetch a single product by ID
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(`Received request for GET /api/items/${id}`);
     // ** Add validation for id **
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        if (Array.isArray(rows) && rows.length > 0) {
             console.log(`Workspaceed product with ID ${id}.`);
            res.status(200).json(rows[0]);
        } else {
             console.log(`Product with ID ${id} not found.`);
            res.status(404).json({ message: `Product with ID ${id} not found` });
        }
    } catch (error: any) {
        console.error(`Error fetching product ${id}:`, error.message);
        res.status(500).json({ message: 'Error fetching product' });
    }
});

// POST /api/items - Add a new canonical product
router.post('/', async (req: Request, res: Response) => {
    // ** Add validation for req.body **
    const { name, description, manufacturer, canonical_department, default_units } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Product name is required' });
    }
    console.log('Received request for POST /api/items with name:', name);
    try {
        const sql = 'INSERT INTO products (name, description, manufacturer, canonical_department, default_units) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [name, description || null, manufacturer || null, canonical_department || null, default_units || null]);
        const insertId = (result as any).insertId;
         console.log(`Created product with ID ${insertId}.`);
        res.status(201).json({ message: 'Product created successfully', productId: insertId });
    } catch (error: any) {
        console.error('Error creating product:', error.message);
        // Handle potential duplicate errors if you add unique constraints later
        res.status(500).json({ message: 'Error creating product' });
    }
});


export default router;
// src/stores/router.ts
import express, { Request, Response, Router } from 'express';
import pool from '../config/database'; // Import the database pool
import storeService from './service';

const router: Router = express.Router();

// GET /api/stores - Fetch all stores
router.get(
    '/',
    async (req: Request, res: Response) => {
        try {
            const stores = await storeService.getAllStores();
            res.status(200).json({
                message: 'Stores fetched successfully!',
                count: stores.length,
                data: stores,
            });
        } catch (error: any) {
            console.error('StoreRouter: Error fetching stores:', error.message);
            res.status(500).json({ message: error.message || 'Server error while fetching stores.' });
        }
    }
);

/**
 * @route   GET /api/stores/:storeId
 * @desc    Get a single store by ID
 * @access  Public (or Private)
 */
router.get(
    '/:storeId',
    // validateRequest(storeIdParamSchema), // Example if you add param validation
    async (req: Request, res: Response) => {
        try {
            const storeId = parseInt(req.params.storeId, 10);
            if (isNaN(storeId)) {
                return res.status(400).json({ message: 'Invalid store ID format.' });
            }

            const store = await storeService.getStoreById(storeId);
            if (!store) {
                return res.status(404).json({ message: `Store with ID ${storeId} not found.` });
            }
            res.status(200).json({
                message: 'Store fetched successfully!',
                data: store,
            });
        } catch (error: any) {
            console.error(`StoreRouter: Error fetching store ID ${req.params.storeId}:`, error.message);
            res.status(500).json({ message: error.message || 'Server error while fetching store.' });
        }
    }
);

// // POST /api/stores - Add a new store
// router.post('/', async (req: Request, res: Response) => {
//      // ** Add validation for req.body **
//     const { name, base_url } = req.body;
//      if (!name) {
//         return res.status(400).json({ message: 'Store name is required' });
//     }
//     console.log('Received request for POST /api/stores with name:', name);
//     try {
//         const sql = 'INSERT INTO stores (name, base_url) VALUES (?, ?)';
//         const [result] = await pool.query(sql, [name, base_url || null]);
//         const insertId = (result as any).insertId;
//         console.log(`Created store with ID ${insertId}.`);
//         res.status(201).json({ message: 'Store created successfully', storeId: insertId });
//     } catch (error: any) {
//         console.error('Error creating store:', error.message);
//          // Handle potential duplicate name error (UNIQUE constraint)
//          if (error.code === 'ER_DUP_ENTRY') {
//              return res.status(409).json({ message: 'Store name already exists' });
//          }
//         res.status(500).json({ message: 'Error creating store' });
//     }
// });

// Add GET by ID, PUT, DELETE routes similarly...

export default router;
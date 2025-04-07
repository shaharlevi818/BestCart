// src/routes/users.ts
import express, { Request, Response, Router } from 'express';
// import pool from '../database'; // Import pool when ready to implement

const router: Router = express.Router();

// GET /api/users - Placeholder
router.get('/', async (req: Request, res: Response) => {
    // TODO: Implement fetching users when users table exists
    res.status(501).json({ message: 'User fetching not implemented yet' });
});

// POST /api/users - Placeholder
router.post('/', async (req: Request, res: Response) => {
     // TODO: Implement user creation (registration) when users table exists
     // Remember password hashing!
    res.status(501).json({ message: 'User creation not implemented yet' });
});

// Add other user routes (login, profile, etc.) later

export default router;
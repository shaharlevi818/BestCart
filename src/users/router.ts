// src/users/router.ts
import express, { Request, Response, Router } from 'express';
import userService from '../users/service';
import { validateRequest } from '../middleware/validateRequest'; // Assuming you have this
import { createUserSchema,userIdParamSchema, ValidatedUserIdParams } from './schemas';
import { CreateUserDto } from './interface';
// import pool from '../database'; // Import pool when ready to implement

const router: Router = express.Router();

// GET /api/users 
router.get(
    '/',
    async (req: Request, res: Response) => {
        try {
            const users = await userService.getAllUsers();
            res.status(200).json({
                message: 'Users fetched successfully!',
                count: users.length,
                data: users,
            });
        } catch (error: any) {
            console.error('UserRouter: Error fetching all users:', error.message);
            res.status(500).json({ message: error.message || 'Server error while fetching all users.' });
        }
    }
);

router.get(
    '/:userId',
    validateRequest(userIdParamSchema), // Validate userId format
    async (req: Request, res: Response) => {
        try {
            // Zod schema has transformed userId to a number
            const { userId } = req.params as unknown as ValidatedUserIdParams;

            const user = await userService.findUserById(userId);
            if (!user) {
                return res.status(404).json({ message: `User with ID ${userId} not found.` });
            }
            res.status(200).json({
                message: 'User fetched successfully!',
                data: user,
            });
        } catch (error: any) {
            console.error(`UserRouter: Error fetching user ID ${req.params.userId}:`, error.message);
            res.status(500).json({ message: error.message || 'Server error while fetching user.' });
        }
    }
);

// POST /api/users 
router.post(
    '/',
    validateRequest(createUserSchema), // Validate request body
    async (req: Request, res: Response) => {
        try {
            const createUserDto = req.body as CreateUserDto; // Zod validation ensures body matches
            const newUser = await userService.createUser(createUserDto);
            res.status(201).json({
                message: 'User created successfully!',
                data: newUser, // Service returns User type (no password_hash)
            });
        } catch (error: any) {
            console.error('UserRouter: Error creating user:', error.message);
            if (error.message.includes('Email already in use') || error.message.includes('Email already exists')) {
                return res.status(409).json({ message: error.message }); // 409 Conflict
            }
            res.status(500).json({ message: error.message || 'Server error during user registration.' });
        }
    }
);



// Add other user routes (login, profile, etc.) later

export default router;
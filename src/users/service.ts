// src/users/rservice.ts

import pool from '../config/database';
import bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'; // Import specific types from mysql2
import shoppingListService from '../shoppingLists/service';
import productService from '../products/service';


// <<< Import the interfaces
import {
    ShoppingList,
    ListItem,
    CreateListDto,
    ListProduct,
} from '../shoppingLists/interface';
import {
    Product
} from '../products/interface';
import { 
    User, 
    CreateUserDto, 
    UserWithPassword 
} from '../users/interface';

const SALT_ROUNDS = 10;

class UserService {

    async createUser(userData: CreateUserDto): Promise<User> {
        const existingUser = await this.findUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('Email already in use.');
        }

        const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

        const sql = `
            INSERT INTO users (email, password_hash, name, preferred_store_id)
            VALUES (?, ?, ?, ?)
        `;
        try {
            const [result] = await pool.query<ResultSetHeader>(sql, [
                userData.email,
                passwordHash,
                userData.name || null,
                userData.preferred_store_id || null,
            ]);

            if (result.insertId) {
                const createdUser = await this.findUserById(result.insertId);
                if (!createdUser) {
                    throw new Error('Failed to retrieve created user.');
                }
                return createdUser;
            } else {
                throw new Error('User creation failed, no insert ID returned.');
            }
        } catch (error: any) {
            console.error('UserService: Error creating user:', error);
            if (error.code === 'ER_DUP_ENTRY' && error.message.includes('email')) {
                 throw new Error('Email already exists.');
            }
            throw new Error('Database error during user creation.');
        }
    }

    /**
     * Finds a user by their ID.
     * @param id The user's ID.
     * @returns The User object or null if not found.
     */
    async findUserById(id: number): Promise<User | null> {
        const sql = 'SELECT id, email, name, preferred_store_id, created_at, updated_at FROM users WHERE id = ?';
        const [rows] = await pool.query<RowDataPacket[]>(sql, [id]);
        if (rows.length > 0) {
            // Ensure created_at and updated_at are Date objects
            const userRow = rows[0];
            return {
                id: userRow.id,
                email: userRow.email,
                name: userRow.name,
                preferred_store_id: userRow.preferred_store_id,
                created_at: new Date(userRow.created_at),
                updated_at: new Date(userRow.updated_at),
            } as User;
        }
        return null;
    }

    /**
     * Finds a user by email.
     * This method returns the user including the password hash for internal use (e.g., login).
     * @param email The user's email.
     * @returns The UserWithPassword object or null if not found.
     */
    async findUserByEmail(email: string): Promise<UserWithPassword | null> {
        const sql = 'SELECT id, email, password_hash, name, preferred_store_id, created_at, updated_at FROM users WHERE email = ?';
        const [rows] = await pool.query<RowDataPacket[]>(sql, [email]);
        if (rows.length > 0) {
             const userRow = rows[0];
            return {
                id: userRow.id,
                email: userRow.email,
                password_hash: userRow.password_hash,
                name: userRow.name,
                preferred_store_id: userRow.preferred_store_id,
                created_at: new Date(userRow.created_at),
                updated_at: new Date(userRow.updated_at),
            } as UserWithPassword;
        }
        return null;
    }

    async getAllUsers(): Promise<User[]> {
        // SQL query to select user fields, excluding password_hash
        // It's crucial that password_hash is not selected here for security.
        const sql = 'SELECT id, email, name, preferred_store_id, created_at, updated_at FROM users ORDER BY created_at DESC';
        try {
            // Execute the query
            const [rows] = await pool.query<RowDataPacket[]>(sql);

            // Map the raw database rows to User objects
            // This includes converting timestamp strings to Date objects if necessary
            return rows.map(row => ({
                id: row.id,
                email: row.email,
                name: row.name, // This is based on your schema.sql having a 'name' column
                preferred_store_id: row.preferred_store_id,
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at),
            })) as User[]; // Cast to User[]
        } catch (error) {
            console.error('UserService: Error fetching all users:', error);
            // In a real application, you might throw a custom error or handle it more gracefully
            throw new Error('Database error while fetching users.');
        }
    }



    // may need to be in userService 
    async checkUserOwnership(userId: number, listId: number): Promise<Boolean> {
        console.log(`DEBUG:SERVICE: checkUserOwnership.`);
        // add validation
        const sql = 'SELECT * FROM shopping_list WHERE id = ?';
        try {
            const [[rows]] = await pool.query<RowDataPacket[]>(sql, [listId]);
            if (userId === rows.user_id) {
                console.log(`SERVICE: User DO own the list` );
                return true;
            } else {
                console.log(`SERVICE: User DO NOT own the list` );
                return false;
            }
            
        } catch (error: any) {
            console.error(`Service Error checking ownership of the list.`, error);
            throw new Error(`Could not check list's owner.`);  
        }
    }
}

export default new UserService();
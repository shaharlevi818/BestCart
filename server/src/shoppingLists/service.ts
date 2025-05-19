// src/shoppingLists/service.ts

import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'; // Import specific types from mysql2
import productService from '../products/service';
import userService from '../users/service';
// <<< Import the interfaces
import {
    ShoppingList,
    CreateListDto,
} from '../shoppingLists/interface';

import {
    Product
} from '../products/interface';

// --- Service Class ---

class ShoppingListService {

    // == Shopping List Methods ==

    
    // <<< Return type updated
    async getAllListsForUser(userId: number): Promise<ShoppingList[]> {
        console.log(`SERVICE: getAllListsForUser(${userId}).`);
        const sql = 'SELECT * FROM shopping_lists WHERE user_id = ? ORDER BY id ASC';
        try {
            const [rows] = await pool.query<RowDataPacket[]>(sql, [userId]);
            console.log("SERVICE: getAllListsForUser fetched lists successfully.")
            if (rows.length == 0) {
                return [];
            }
            // <<< Type assertion updated
            return rows as ShoppingList[];
        } catch (error) {
            console.error(`Service Error fetching lists for user &{userId}:`, error);
            throw new Error('Could not retrieve shopping lists.');
        }
    }

    
    // --- This function returns information about specific list. 
    async getListByListId(userId: number, listId: number): Promise<ShoppingList | null> {
        console.log(`SERVICE: getListByListId.`);
        const sql = 'SELECT id, name, description, is_template, user_id, created_at, updated_at FROM shopping_lists WHERE id = ?';
        try {
            const [result] = await pool.query<RowDataPacket[]>(sql, [listId]);
            if (result.length === 0) {
                console.log(`SERVICE: List with id ${listId} not found.`);
                return null;
            }
            console.log(`SERVICE: Get List By Id: ${listId} fetched successfully.`);
            const listData = result[0]; // listData is one of RowDataPacket
            return listData as ShoppingList;
        } catch (error) {
            console.error(`SERVICE: Error fetching list ID: ${listId} for user: ${userId}`, error);
            throw new Error(`SERVICE: Could not retrieve shopping list.`);
        }
    }

    // --- Thid function creates new shopping list for specific user_id and returns new listId ---
    async createList(listData: CreateListDto, userId: number): Promise<number> {
        console.log(`SERVICE: createList for user ${userId} with data:`, listData);
        const { name, description, is_template } = listData;
        const sql = 'INSERT INTO shopping_lists (name, description, is_template, user_id) VALUES (?, ?, ?, ?)';
        try {
            // <<< Specify OkPacket type for result if applicable
            const [result] = await pool.query<ResultSetHeader>(sql, [
                name,
                description || null,
                is_template || false,
                userId
            ]);
            console.log(`SERVICE: Created list with ID ${result.insertId}.`);
            // <<< No 'as any' needed if OkPacket is used correctly
            return result.insertId;
        } catch (error) {
            console.error('Service Error creating list:', error);
            throw new Error('Database error while creating list.');
        }
    }
}

// Export a single instance of the service
export default new ShoppingListService();
    






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
    /**
     * Fetches all NON-TEMPLATE shopping lists for a given user, ordered by most recent.
     */
    async getAllListsForUser(userId: number): Promise<ShoppingList[]> {
        console.log(`SERVICE: getAllListsForUser(${userId}).`);
        // Added "is_template = false" to get only active lists and ordered by most recently updated
        const sql = 'SELECT * FROM shopping_lists WHERE user_id = ? AND is_template = ? ORDER BY updated_at DESC';
        try {
            const [rows] = await pool.query<RowDataPacket[]>(sql, [userId, false]);
            console.log("SERVICE: getAllListsForUser fetched lists successfully.")
            return rows as ShoppingList[]; // Returns [] if no rows, which is correct
        } catch (error) {
            console.error(`Service Error fetching lists for user ${userId}:`, error);
            throw new Error('Could not retrieve shopping lists.');
        }
    }

    /**
     * Fetches a single shopping list by its ID, ensuring it belongs to the user.
     */
async getListByListId(userId: number, listId: number): Promise<ShoppingList | null> {
    console.log(`SERVICE: getListByListId for user ${userId} and list ${listId}.`);
    const sql = 'SELECT id, name, description, is_template, user_id, created_at, updated_at FROM shopping_lists WHERE id = ? AND user_id = ?;';
    try {
        // Pass BOTH listId and userId to the query
        const [result] = await pool.query<RowDataPacket[]>(sql, [listId, userId]);
        if (result.length === 0) {
            console.log(`SERVICE: List with id ${listId} not found or does not belong to user ${userId}.`);
            return null;
        }
        console.log(`SERVICE: Get List By Id: ${listId} fetched successfully.`);
        const listData = result[0];
        return listData as ShoppingList;
    } catch (error) {
        console.error(`SERVICE: Error fetching list ID: ${listId} for user: ${userId}`, error);
        throw new Error(`SERVICE: Could not retrieve shopping list.`);
    }
}

    /**
     * Creates a new shopping list for a specific user and returns its new ID.
     */
    async createList(listData: CreateListDto, userId: number): Promise<ShoppingList> {
        console.log(`SERVICE: createList for user ${userId} with data:`, listData);
        const { name, description, is_template } = listData;
        const sql = 'INSERT INTO shopping_lists (name, description, is_template, user_id) VALUES (?, ?, ?, ?)';
        try {
            const [result] = await pool.query<ResultSetHeader>(sql, [
                name,
                description || null,
                is_template || false,
                userId
            ]);
            const newListId = result.insertId;
            console.log(`SERVICE: Created list with ID ${newListId}.`);
            const newList = await this.getListByListId(userId, newListId);
            if (!newList) {
                console.error(`SERVICE: Created list ID ${newListId} not found after creation.`);
                throw new Error('Created list not found after creation.');
            }
            console.log(`SERVICE: Successfully created list with ID ${newListId} for user ${userId}.`);
            // Return the new list
            return newList;
        } catch (error) {
            console.error('Service Error creating list:', error);
            throw new Error('Database error while creating list.');
        }
    }

    /**
     * Deletes a shopping list by its ID, ensuring it belongs to the user.
     * @param userId - The ID of the user who owns the list.
     * @param listId - The ID of the shopping list to delete.
     * @return A promise that resolves to a boolean indicating success or failure.
     */
    
    async deleteListById(userId: number, listId: number): Promise<number> {
        console.log(`SERVICE: deleteListById for user ${userId} and list ${listId}.`);
        // Ensure the list belongs to the user
        const sql = 'DELETE FROM shopping_lists WHERE id = ? AND user_id = ?;';
        try {
            const [result] = await pool.query<ResultSetHeader>(sql, [listId, userId]);
            if (result.affectedRows === 0) {
                console.log(`SERVICE: No list found with ID ${listId} for user ${userId}.`);
                return 0; // No rows deleted
            }
            console.log(`SERVICE: Successfully deleted list with ID ${listId} for user ${userId}.`);
            return result.affectedRows; // Returns number of rows deleted
        } catch (error) {
            console.error(`SERVICE: Error deleting list ID: ${listId} for user: ${userId}`, error);
            throw new Error(`SERVICE: Could not delete shopping list.`);
        }
    }

    /**
     * Updates an existing shopping list.
     * @param listId The ID of the list to update.
     * @param listData The new data for the list.
     * @param userId The ID of the user, for security verification.
     * @returns A promise that resolves to the updated shopping list object.
     */
    async updateList(listId: number, listData: Partial<CreateListDto>, userId: number): Promise<ShoppingList | null> {
        const { name, description, is_template } = listData;
        console.log(`SERVICE: Updating list ${listId} for user ${userId}`);

        // Create a dynamic query based on the fields provided
        const fieldsToUpdate = [];
        const queryParams = [];

        if (name !== undefined) {
            fieldsToUpdate.push('name = ?');
            queryParams.push(name);
        }
        if (description !== undefined) {
            fieldsToUpdate.push('description = ?');
            queryParams.push(description);
        }
        if (is_template !== undefined) {
            fieldsToUpdate.push('is_template = ?');
            queryParams.push(is_template);
        }

        if (fieldsToUpdate.length === 0) {
            // Nothing to update, just return the current list data
            return this.getListByListId(userId, listId);
        }
        
        // Add the listId and userId for the WHERE clause
        queryParams.push(listId, userId);

        const sql = `UPDATE shopping_lists SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND user_id = ?;`;

        try {
            const [result] = await pool.query<ResultSetHeader>(sql, queryParams);
            
            if (result.affectedRows === 0) {
                console.log(`SERVICE: Update failed. List ${listId} not found for user ${userId}.`);
                return null; // Or throw an error
            }

            // Return the newly updated list data
            return this.getListByListId(userId, listId);
        } catch (error) {
            console.error(`Service Error updating list ${listId}:`, error);
            throw new Error('Database error while updating list.');
        }
    }
    async addItemToList(listId: number, productId: number, userId: number): Promise<ShoppingList | null> {
        console.log(`SERVICE: addItemToList for list ${listId}, product ${productId}, user ${userId}.`);
        
        // First, check if the list exists and belongs to the user
        const list = await this.getListByListId(userId, listId);
        if (!list) {
            console.error(`SERVICE: List with ID ${listId} not found or does not belong to user ${userId}.`);
            return null;
        }

        // Check if the product exists
        const product = await productService.getProductById(productId);
        if (!product) {
            console.error(`SERVICE: Product with ID ${productId} not found.`);
            return null;
        }

        // Insert the product into the list_items table
        const sql = 'INSERT INTO list_items (shopping_list_id, product_id) VALUES (?, ?)';
        try {
            await pool.query<ResultSetHeader>(sql, [listId, productId]);
            console.log(`SERVICE: Successfully added product ${productId} to list ${listId}.`);
            return this.getListByListId(userId, listId); // Return the updated list
        } catch (error) {
            console.error(`SERVICE: Error adding product ${productId} to list ${listId}:`, error);
            throw new Error('Database error while adding item to list.');
        }
    }
}

export default new ShoppingListService();





// src/users/rservice.ts

import pool from '../config/database';
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

class UserService {
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
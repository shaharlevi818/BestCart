// src/stores/service.ts

import pool from '../config/database';
import { RowDataPacket } from 'mysql2/promise';
import { Store } from './interface';

class StoreService {
    /**
     * Retrieves all stores from the database.
     * @returns A promise that resolves to an array of Store objects.
     */
    async getAllStores(): Promise<Store[]> {
        const sql = 'SELECT id, name, base_url, created_at, updated_at FROM stores ORDER BY name ASC';
        try {
            const [rows] = await pool.query<RowDataPacket[]>(sql);
            return rows.map(row => ({
                id: row.id,
                name: row.name,
                base_url: row.base_url,
                created_at: new Date(row.created_at),
                updated_at: new Date(row.updated_at),
            })) as Store[];
        } catch (error) {
            console.error('StoreService: Error fetching all stores:', error);
            throw new Error('Database error while fetching stores.');
        }
    }

    /**
     * Retrieves a single store by its ID.
     * @param storeId The ID of the store.
     * @returns A promise that resolves to a Store object or null if not found.
     */
    async getStoreById(storeId: number): Promise<Store | null> {
        const sql = 'SELECT id, name, base_url, created_at, updated_at FROM stores WHERE id = ?';
        try {
            const [rows] = await pool.query<RowDataPacket[]>(sql, [storeId]);
            if (rows.length > 0) {
                const row = rows[0];
                return {
                    id: row.id,
                    name: row.name,
                    base_url: row.base_url,
                    created_at: new Date(row.created_at),
                    updated_at: new Date(row.updated_at),
                } as Store;
            }
            return null;
        } catch (error) {
            console.error(`StoreService: Error fetching store by ID ${storeId}:`, error);
            throw new Error('Database error while fetching store.');
        }
    }
}

export default new StoreService();

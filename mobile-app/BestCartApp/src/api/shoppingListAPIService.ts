// src/api/shoppingListAPIService.ts
// This file provides functions to interact with the shopping list API endpoints.

import apiClient from './apiClient';
import { ShoppingList } from '../types';
//import { DisplayListItem } from '../types';
import { ShoppingListProductView } from '../types'

// The data struct/apure for creating a new list
interface CreateListData {
  name: string;
  description: string | null;
  is_template: boolean;
}


/**
 * Fetches all shopping lists for the current user.
 * @returns A promise that resolves to an array of ShoppingList objects.
 */
const getShoppingLists = async (): Promise<ShoppingList[]> => {
  try {
    const response = await apiClient.get('/shopping-lists');
    return response.data;
  } catch (error) {
    console.error('API Error fetching shopping lists:', error);
    throw error; // Re-throw to be handled by the component
  }
};

/**
 * Fetches a specific shopping list by its ID.
 * @param listId The ID of the shopping list to fetch.
 * @return A promise that resolves to a ShoppingList object.
 */
const getShoppingListById = async (listId: number): Promise<ShoppingList> => {
  try {
    const response = await apiClient.get(`/shopping-lists/${listId}`);
    return response.data;
  } catch (error) {
    console.error(`API Error fetching list ${listId}:`, error);
    throw error;
  }
};

/**
 * Fetches all products in a specific shopping list by its ID.
 * @param listId The ID of the shopping list to fetch products for.
 * @return A promise that resolves to an array of products in the list.
 */
const getListProducts = async (listId: number): Promise<ShoppingListProductView[]> => {
  try {
    const response = await apiClient.get(`/shopping-lists/${listId}/products`);
    return response.data.data;
  } catch (error) {
    console.error(`API Error fetching products for list ${listId}:`, error);
    throw error;
  }
};

/**
 * Creates a new shopping list.
 * @param listData The data for the new list.
 * @return A promise that resolves to the newly created ShoppingList object.
 */
const createShoppingList = async (listData: CreateListData): Promise<ShoppingList> => {
  try {
    const response = await apiClient.post('/shopping-lists', listData);
    // The server now returns the newly created list object in response.data.data
    return response.data.data;      // look for the data field in the response: { "data": { "id": 123, "name": "New List", ... } }
  } catch (error) {
    console.error('API Error creating shopping list:', error);
    throw error;
  }
};

/**
 * Deletes a specific shopping list by its ID.
 * @param listId The ID of the shopping list to delete.
 * @return A promise that resolves when the deletion is complete.
 */
const deleteShoppingList = async (listId: number): Promise<void> => {
  try {
    await apiClient.delete(`/shopping-lists/${listId}`);
  } catch (error) {
    console.error(`API Error deleting shopping list ${listId}:`, error);
    throw error;
  }
};

const updateShoppingList = async (listId: number, listData: Partial<CreateListData>): Promise<ShoppingList> => {
  try {
    const response = await apiClient.put(`/shopping-lists/${listId}`, listData);
    // Assuming the server returns the updated list in response.data.data
    return response.data.data; // look for the data field in the response: { "data": { "id": 123, "name": "Updated List", ... } }
  } catch (error) {
    console.error(`API Error updating shopping list ${listId}:`, error);
    throw error;
  }
};

export const shoppingListAPI = {
  getAll: getShoppingLists,
  getById: getShoppingListById,
  getListProducts: getListProducts,
  create: createShoppingList,
  update: updateShoppingList,
  delete: deleteShoppingList,
};


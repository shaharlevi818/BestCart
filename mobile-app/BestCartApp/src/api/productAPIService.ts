// src/api/productAPIService.ts

// src/api/productAPIService.ts

import apiClient from './apiClient';
import { ProductSearchResult, ListItem, Product } from '../types';

/**
 * Searches for products based on a query string and user ID.
 * @param query The user's search text.
 * @param userId The ID of the current user.
 * @returns A promise that resolves to an array of product search results.
 */
const searchProducts = async (query: string, userId: number): Promise<ProductSearchResult[]> => {
  try {
    // We send the parameters as URL query params
    const response = await apiClient.get('/products/search', {
      params: {
        q: query,
        userId: userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`API Error searching for products with query "${query}":`, error);
    // Return an empty array on error so the UI doesn't crash
    return [];
  }
};

/**
 * Adds a product to a specific shopping list.
 * @param listId The ID of the shopping list.
 * @param productId The ID of the product to add.
 * @returns The newly created list item.
 */
const addProductToList = async (listId: number, productId: number): Promise<ListItem> => {
    try {
        const response = await apiClient.post(`/shopping-lists/${listId}/items`, {
            productId: productId,
            // The server can handle setting a default quantity
        });
        return response.data.data;
    } catch (error) {
        console.error(`API Error adding product ${productId} to list ${listId}:`, error);
        throw error;
    }
};

export const productAPI = {
  search: searchProducts,
  addProductToList: addProductToList,
};

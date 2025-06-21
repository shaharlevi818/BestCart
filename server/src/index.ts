// src/index.ts

import dotenv from 'dotenv';
dotenv.config(); // Load .env variables FIRST

import express, { Express, Request, Response } from 'express';
import cors from 'cors';

// --- Route Imports ---
// No longer importing from './routes/...' for features
import productRouter from './products/router';        // Correct path based on structure
import shoppingListRouter from './shoppingLists/router'; // Correct path based on structure
import storeRouter from './stores/router';           // Correct path based on structure
import userRouter from './users/router';             // Correct path based on structure
// Removed departmentsRouter and listsManagerRouter imports

// --- App Initialization ---
const app: Express = express();
const PORT = process.env.PORT || 3000; // Use PORT from .env or default

// --- Middleware ---
app.use(cors());          // Enable CORS
app.use(express.json());  // Enable JSON body parsing

// --- Basic Routes / Health Check ---
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, BestCart API Server is Running on port 3000!'); // Updated message slightly
});

// --- API Routes - Mount routers ---
// Mount routers from feature folders onto base API paths
app.use('/api/products', productRouter);      // Corresponds to src/products/router.ts
app.use('/api/shopping-lists', shoppingListRouter);   // Corresponds to src/shoppingLists/router.ts
app.use('/api/stores', storeRouter);         // Corresponds to src/stores/router.ts
app.use('/api/users', userRouter);           // Corresponds to src/users/router.ts
// Removed app.use for departmentsRouter and listsManagerRouter

// --- Standalone Routes (Consider moving '/scrape' to its own router/service later) ---
app.post('/api/scrape', (req: Request, res: Response) => { // Added /api prefix for consistency
  // ** Add Input Validation here! **
  const groceryList = req.body;
  console.log('Received grocery list for scraping:', groceryList);
  // TODO: Call a ScrapingService here
  res.status(501).json({ message: 'Scraping not implemented yet', receivedList: groceryList }); // Use 501 Not Implemented
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`[server]: Server is running on http://localhost:${PORT}`);
  // Optional: The database connection log should appear automatically when
  // database.ts is first imported by one of the services.
});

// ADD THIS TEST ROUTE:
app.get('/api/test', (req, res) => {
  console.log('SUCCESS: /api/test route was hit!');
  res.status(200).send('API Test Route is Working!');
});
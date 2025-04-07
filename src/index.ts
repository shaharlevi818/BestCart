// src/index.ts 
import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';

// --- Route Imports (Simplified) ---
import departmentsRouter from './routes/departments';
import itemsRouter from './routes/items';
import listsRouter from './routes/lists';
import storesRouter from './routes/stores';
import listsManagerRouter from './routes/listsManager';
import usersRouter from './routes/users'; 

// --- App Initialization ---
const app: Express = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Basic Routes / Health Check ---
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, BestCart API Server!');
});

// --- API Routes - Mount routers ---
app.use('/api/departments', departmentsRouter);
app.use('/api/items', itemsRouter);
app.use('/api/lists', listsRouter);
app.use('/api/stores', storesRouter);
app.use('/api/listsManager', listsManagerRouter);
app.use('/api/users', usersRouter); 

// Specific endpoint
app.post('/scrape', (req: Request, res: Response) => {
  const groceryList = req.body;
  console.log('Received grocery list for scraping:', groceryList);
  res.json({ message: 'Scraping initiated (placeholder)', receivedList: groceryList });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`[server]: Server is running on http://localhost:${PORT}`);
});
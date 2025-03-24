import express, { Request, Response } from 'express';
import cors from 'cors';
import departmentsRouter from './routes/departments'; // Import the departments router
import itemsRouter from './routes/items'; // Import the items router
import listsRouter from './routes/lists'; // Import the lists router
import storesRouter from './routes/stores'; // Import the stores router
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Grocery Scraper API!');
});

app.use('/departments', departmentsRouter); // Mount the departments router
app.use('/items', itemsRouter); // Mount the items router
app.use('/lists', listsRouter); // Mount the lists router
app.use('/stores', storesRouter); // Mount the stores router
app.post('/scrape', (req: Request, res: Response) => {
  const groceryList = req.body;
  console.log('Received grocery list:', groceryList);
  res.json({ message: 'Scraping started...', receivedList: groceryList });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
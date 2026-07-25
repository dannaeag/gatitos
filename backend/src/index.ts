import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { categoriesRouter } from './routes/categories.js';
import { transactionsRouter } from './routes/transactions.js';
import { budgetsRouter } from './routes/budgets.js';
import { seedDefaultCategories } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Root route for Render ping and health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'radiant-volta-backend' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'radiant-volta-backend' });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'radiant-volta-backend' });
});

// Seed endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await seedDefaultCategories();
    res.json({ message: 'Database seeded successfully with default categories' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);

app.listen(PORT, async () => {
  console.log(`🚀 Radiant Volta Backend running on http://localhost:${PORT}`);
  try {
    await seedDefaultCategories();
  } catch (e) {
    console.log('Seeding skipped or DB not connected yet:', e);
  }
});

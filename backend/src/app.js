import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

import { seedDatabase } from './seed.js';

const app = express();

const origin = process.env.CLIENT_URL || '*';
app.use(cors({ origin: origin === '*' ? true : origin.split(',') }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 1-Click Cloud Database Seed Endpoint (Protected by ADMIN_PASSWORD)
app.get('/api/seed', async (req, res) => {
  const key = req.query.key;
  const expected = process.env.ADMIN_PASSWORD || '124Dhruv@';
  if (key !== expected) {
    return res.status(401).json({ error: 'Unauthorized. Please provide ?key=ADMIN_PASSWORD' });
  }
  try {
    const result = await seedDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

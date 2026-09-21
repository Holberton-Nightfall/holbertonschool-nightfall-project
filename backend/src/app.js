import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';

import categoriesRoutes from './routes/categories.routes.js';
import experiencesRoutes from './routes/experiences.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/categories', categoriesRoutes);
app.use('/api/experiences', experiencesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.use(errorHandler);

export default app;
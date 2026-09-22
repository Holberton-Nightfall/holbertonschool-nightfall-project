import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.js';
import experiencesRoutes from './routes/experiences.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import authRoutes from './routes/auth.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';

const app = express();

// En-têtes HTTP de sécurité
app.use(helmet());
// Autorise uniquement le front (URL définie dans .env)
app.use(cors({ origin: process.env.CORS_ORIGIN }));
// Lit le body JSON des requêtes
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/categories', categoriesRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);

// Route inconnue : 404 en JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// Doit rester en dernier pour attraper les erreurs
app.use(errorHandler);

export default app;
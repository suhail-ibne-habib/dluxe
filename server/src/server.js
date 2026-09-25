const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['set-auth-token'],
}));

async function start() {
  const { toNodeHandler, fromNodeHeaders } = await import('better-auth/node');
  const { auth, ensureAdminAccount } = await import('./auth.mjs');

  // Better Auth must be mounted before the JSON body parser.
  // https://www.better-auth.com/docs/integrations/express
  app.all('/api/auth/*', toNodeHandler(auth));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      if (session?.user) req.authUser = session.user;
    } catch (error) {
      console.error('Session lookup failed:', error.message);
    }
    next();
  });

  function requireAdmin(req, res, next) {
    if (!req.authUser || req.authUser.role !== 'admin') {
      return res.status(401).json({ message: 'Admin session required' });
    }
    return next();
  }

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  app.get('/api/health', async (req, res) => {
    try {
      const { query } = require('./config/db');
      await query('SELECT 1');
      res.json({ status: 'ok', database: 'ok', timestamp: new Date() });
    } catch (error) {
      console.error('Health check failed:', error.message);
      res.status(503).json({ status: 'error', database: 'unavailable' });
    }
  });

  const locationRoutes = require('./routes/locations');
  const reservationRoutes = require('./routes/reservations');
  const packageRoutes = require('./routes/packages');
  const leadsRoutes = require('./routes/leads');
  const adminRoutes = require('./routes/admin');
  const userRoutes = require('./routes/user');
  const settingsRoutes = require('./routes/settings');
  const airportPagesRoutes = require('./routes/airport_pages');
  const testimonialsRoutes = require('./routes/testimonials');
  const airlineRoutes = require('./routes/airlines');

  app.use('/api/locations', locationRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/packages', packageRoutes);
  app.use('/api/leads', leadsRoutes);
  app.use('/api/admin', requireAdmin, adminRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/airport-pages', airportPagesRoutes);
  app.use('/api/testimonials', testimonialsRoutes);
  app.use('/api/airlines', airlineRoutes);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
  });

  const { ensureSchema } = require('./config/bootstrap');
  await ensureSchema();
  await ensureAdminAccount();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;

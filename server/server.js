require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const artisanRoutes = require('./routes/artisans');
const serviceRequestRoutes = require('./routes/serviceRequests');
const bookingRoutes = require('./routes/bookings');
const ratingRoutes = require('./routes/ratings');
const adminRoutes = require('./routes/admin');
const disputeRoutes = require('./routes/disputes');
const { initializeDatabase } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://vendorlink-mocha.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean).map(url => url.replace(/\/$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      process.env.NODE_ENV !== 'production' ||
      /\.vercel\.app$/.test(new URL(origin).hostname)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/disputes', disputeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vendor Management API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initializeDatabase();
  });
}

module.exports = app;

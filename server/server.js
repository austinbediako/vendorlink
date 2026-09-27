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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

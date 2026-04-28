const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const adminRoutes = require('./routes/admin.routes');
const sellerRoutes = require('./routes/seller.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'MultiVendor Product API is running' });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error Handler
app.use(errorHandler);

module.exports = app;

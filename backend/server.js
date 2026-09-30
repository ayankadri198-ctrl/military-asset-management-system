const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB, getClient } = require('./config/db');
const { initializeDatabase } = require('./models/dbInit');
const { errorHandler } = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const personnelRoutes = require('./routes/personnelRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const transferRoutes = require('./routes/transferRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-logs', activityRoutes);

// System Health & Status Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Defense Logistics & Asset Management System (DLAMS) REST API',
    databaseEngine: getClient().toUpperCase(),
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Defense Logistics & Asset Management System (DLAMS) API</title></head>
      <body style="font-family: monospace; background: #0f172a; color: #38bdf8; padding: 40px;">
        <h1>DEFENSE LOGISTICS & ASSET MANAGEMENT SYSTEM (DLAMS) - BACKEND API</h1>
        <p>Operational Status: <strong>ONLINE [ACTIVE]</strong></p>
        <p>Engine: <strong>${getClient().toUpperCase()}</strong></p>
        <p>Docs endpoint: <a href="/api/health" style="color: #4ade80;">/api/health</a></p>
      </body>
    </html>
  `);
});

// Central Error Handler
app.use(errorHandler);

// Start server and initialize database
async function startServer() {
  try {
    console.log('====================================================');
    console.log(' DEFENSE LOGISTICS & ASSET MANAGEMENT SYSTEM (DLAMS)');
    console.log(' Joint Logistics Command HQ Server Initializing...');
    console.log('====================================================');

    await connectDB();
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`[Command Server] Running securely on port ${PORT}`);
      console.log(`[Command Server] REST API Base: http://localhost:${PORT}/api`);
      console.log(`[Command Server] Database Driver: ${getClient().toUpperCase()}`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('[Command Server] Fatal error during startup:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;

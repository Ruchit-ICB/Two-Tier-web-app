const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, pool } = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/tasks', taskRoutes);

// Health check endpoint (Critical for DevOps Docker/Kubernetes)
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'UP',
      timestamp: new Date(),
      services: {
        database: 'UP',
        api: 'UP'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date(),
      services: {
        database: 'DOWN',
        api: 'UP',
        error: error.message
      }
    });
  }
});

// Serve frontend build static files in production
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

// Fallback to React index.html for Single Page Application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      // If index.html doesn't exist (e.g. running in development mode without build)
      res.status(404).send('TaskSphere Web App API - Development Mode (Static frontend not built)');
    }
  });
});

// Start Server and Init Database
const startServer = async () => {
  try {
    // In Docker/K8s environment, the DB container might take a few moments to spin up.
    // We retry connecting to the database if it fails.
    let retries = 5;
    while (retries) {
      try {
        await initializeDatabase();
        break;
      } catch (err) {
        retries -= 1;
        console.warn(`Database connection failed. Retries left: ${retries}. Waiting 5 seconds...`);
        if (retries === 0) throw err;
        await new Promise(res => setTimeout(res, 5000));
      }
    }

    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start TaskSphere Application Server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; // Export for testing

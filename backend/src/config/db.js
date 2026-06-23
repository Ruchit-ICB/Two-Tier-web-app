const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// In K8s or Docker Compose, connection parameters are passed via env vars
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tasksphere',
  password: process.env.DB_PASSWORD || 'tasksphere_secure_pass_2026',
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Initializing database schema...');
    
    // Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        category VARCHAR(100) DEFAULT 'General',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if table is empty to insert seed tasks
    const res = await client.query('SELECT COUNT(*) FROM tasks');
    const count = parseInt(res.rows[0].count);

    if (count === 0) {
      console.log('Database empty. Seeding initial demo tasks...');
      const seedQuery = `
        INSERT INTO tasks (title, description, status, priority, category, due_date) VALUES
        ('Set up DevOps pipeline', 'Configure GitHub Actions for CI/CD and Docker builds.', 'in-progress', 'high', 'DevOps', '2026-06-30'),
        ('Design Kanban Board UI', 'Implement responsive layout with glassmorphic cards and dark mode styling.', 'todo', 'medium', 'Design', '2026-06-25'),
        ('Deploy to Kubernetes', 'Write and test deployment manifests for deployment to a local cluster.', 'todo', 'high', 'Infrastructure', '2026-07-05'),
        ('Write backend tests', 'Add unit and integration tests using Jest and Supertest.', 'done', 'low', 'QA', '2026-06-21');
      `;
      await client.query(seedQuery);
      console.log('Demo tasks seeded successfully.');
    } else {
      console.log('Database already contains tasks. Skipping seeding.');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  initializeDatabase,
};

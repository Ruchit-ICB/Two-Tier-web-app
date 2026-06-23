const { pool } = require('../config/db');

const getAllTasks = async () => {
  const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
  const { rows } = await pool.query(query);
  return rows;
};

const getTaskById = async (id) => {
  const query = 'SELECT * FROM tasks WHERE id = $1';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const createTask = async ({ title, description, status, priority, category, due_date }) => {
  const query = `
    INSERT INTO tasks (title, description, status, priority, category, due_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [
    title,
    description,
    status || 'todo',
    priority || 'medium',
    category || 'General',
    due_date || null
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const updateTask = async (id, fields) => {
  // Dynamically build the update query
  const setClauses = [];
  const values = [];
  let index = 1;

  // Add updated_at automatically
  const updatedFields = { ...fields, updated_at: new Date() };

  for (const [key, value] of Object.entries(updatedFields)) {
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE tasks
    SET ${setClauses.join(', ')}
    WHERE id = $${index}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

const deleteTask = async (id) => {
  const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

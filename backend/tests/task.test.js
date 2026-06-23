const request = require('supertest');
const app = require('../src/index');

// Mock pg Pool.query
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  const mPool = {
    connect: jest.fn(() => Promise.resolve(mClient)),
    query: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

const { Pool } = require('pg');
const pool = new Pool();

describe('TaskSphere API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return UP status when DB is connected', async () => {
      // Mock successful DB ping
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.services.database).toBe('UP');
    });

    it('should return DOWN status when DB connection fails', async () => {
      // Mock failed DB ping
      pool.query.mockRejectedValueOnce(new Error('Connection timeout'));

      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(500);
      expect(res.body.status).toBe('DOWN');
      expect(res.body.services.database).toBe('DOWN');
    });
  });

  describe('GET /api/tasks', () => {
    it('should fetch all tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'todo', priority: 'medium' },
        { id: 2, title: 'Task 2', status: 'done', priority: 'high' }
      ];
      pool.query.mockResolvedValueOnce({ rows: mockTasks });

      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('Task 1');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task when input is valid', async () => {
      const newTask = { title: 'New task', description: 'Testing task creation', priority: 'medium' };
      const createdTask = { id: 3, ...newTask, status: 'todo' };
      pool.query.mockResolvedValueOnce({ rows: [createdTask] });

      const res = await request(app)
        .post('/api/tasks')
        .send(newTask);

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBe(3);
      expect(res.body.title).toBe('New task');
      expect(res.body.status).toBe('todo');
    });

    it('should fail with 400 if title is missing', async () => {
      const invalidTask = { description: 'Missing title' };

      const res = await request(app)
        .post('/api/tasks')
        .send(invalidTask);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task details when valid', async () => {
      const updateData = { status: 'in-progress' };
      const existingTask = { id: 1, title: 'Task 1', status: 'todo' };
      const updatedTask = { id: 1, title: 'Task 1', status: 'in-progress' };

      // First query: getTaskById (checks if exists)
      pool.query.mockResolvedValueOnce({ rows: [existingTask] });
      // Second query: updateTask (returns updated row)
      pool.query.mockResolvedValueOnce({ rows: [updatedTask] });

      const res = await request(app)
        .put('/api/tasks/1')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('in-progress');
    });

    it('should return 404 if task to update is not found', async () => {
      // First query: getTaskById returns empty (does not exist)
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .put('/api/tasks/999')
        .send({ status: 'done' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task if it exists', async () => {
      const existingTask = { id: 1, title: 'Task 1', status: 'todo' };

      // First query: getTaskById
      pool.query.mockResolvedValueOnce({ rows: [existingTask] });
      // Second query: deleteTask
      pool.query.mockResolvedValueOnce({ rows: [existingTask] });

      const res = await request(app).delete('/api/tasks/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Task deleted successfully.');
      expect(res.body.id).toBe('1');
    });

    it('should return 404 if task to delete does not exist', async () => {
      // First query: getTaskById
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).delete('/api/tasks/999');

      expect(res.statusCode).toBe(404);
    });
  });
});

const TaskModel = require('../models/taskModel');

const getTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error while fetching tasks.' });
  }
};

const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await TaskModel.getTaskById(id);
    if (!task) {
      return res.status(404).json({ error: `Task with ID ${id} not found.` });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Internal server error while fetching task.' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, category, due_date } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    const newTask = await TaskModel.createTask({
      title,
      description,
      status,
      priority,
      category,
      due_date,
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error while creating task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, category, due_date } = req.body;
    
    // Check if task exists first
    const existingTask = await TaskModel.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ error: `Task with ID ${id} not found.` });
    }

    const updatedTask = await TaskModel.updateTask(id, {
      title,
      description,
      status,
      priority,
      category,
      due_date,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error while updating task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if task exists first
    const existingTask = await TaskModel.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({ error: `Task with ID ${id} not found.` });
    }

    await TaskModel.deleteTask(id);
    res.status(200).json({ message: 'Task deleted successfully.', id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error while deleting task.' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};

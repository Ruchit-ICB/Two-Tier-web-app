import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function TaskFormModal({ isOpen, onClose, onSubmit, taskToEdit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('General');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status || 'todo');
      setPriority(taskToEdit.priority || 'medium');
      setCategory(taskToEdit.category || 'General');
      
      // Parse database date format YYYY-MM-DD for standard html inputs
      if (taskToEdit.due_date) {
        const formattedDate = new Date(taskToEdit.due_date).toISOString().split('T')[0];
        setDueDate(formattedDate);
      } else {
        setDueDate('');
      }
    } else {
      // Clear fields for new task creation
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setCategory('General');
      setDueDate('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category: category.trim() || 'General',
      due_date: dueDate || null
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{taskToEdit ? 'Edit Task' : 'Create Task'}</h2>
          <button className="btn-close" onClick={onClose} id="close-modal-btn">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--priority-high)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input 
              type="text" 
              id="task-title" 
              placeholder="e.g. Write unit tests" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea 
              id="task-description" 
              rows="3" 
              placeholder="Add details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select 
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select 
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-category">Category</label>
              <input 
                type="text" 
                id="task-category" 
                placeholder="e.g. Design, DevOps"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-due-date">Due Date</label>
              <input 
                type="date" 
                id="task-due-date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} id="cancel-form-btn">
              Cancel
            </button>
            <button type="submit" className="btn-primary" id="submit-form-btn">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

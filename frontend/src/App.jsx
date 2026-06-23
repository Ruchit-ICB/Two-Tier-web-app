import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Layers, Database, RefreshCw } from 'lucide-react';
import KanbanBoard from './components/KanbanBoard';
import TaskFormModal from './components/TaskFormModal';
import './App.css';

const API_BASE = '/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState('CHECKING'); // 'UP', 'DOWN', 'CHECKING'
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check Database and Server Health Status
  const checkHealth = async () => {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'UP' && data.services?.database === 'UP') {
          setDbStatus('UP');
        } else {
          setDbStatus('DOWN');
        }
      } else {
        setDbStatus('DOWN');
      }
    } catch (err) {
      console.error('Health check failed:', err);
      setDbStatus('DOWN');
    }
  };

  useEffect(() => {
    fetchTasks();
    checkHealth();
    
    // Check health status every 15 seconds
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle task submission (create or update)
  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        // Edit Mode
        const res = await fetch(`${API_BASE}/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        if (!res.ok) throw new Error('Failed to update task');
        const updatedTask = await res.json();
        
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
      } else {
        // Create Mode
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        if (!res.ok) throw new Error('Failed to create task');
        const newTask = await res.json();
        
        setTasks(prev => [newTask, ...prev]);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      checkHealth(); // Update health in case of DB reconnection
    } catch (err) {
      console.error('Error submitting task form:', err);
      alert('Error saving task. Please check server connection.');
    }
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task');
      
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task.');
    }
  };

  // Move task status column
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Find original task to keep details
      const original = tasks.find(t => t.id === id);
      if (!original) return;

      // Optimistic UI update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        // Rollback on error
        setTasks(prev => prev.map(t => t.id === id ? original : t));
        throw new Error('Failed to update status on server');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  // Edit triggers
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Get unique categories list for filter dropdown
  const categories = ['all', ...new Set(tasks.map(t => t.category).filter(Boolean))];

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    
    return matchesSearch && matchesPriority && matchesCategory;
  });

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header glass-panel">
        <div className="brand-section">
          <span className="brand-logo">🌌</span>
          <div className="brand-title">
            <h1>TaskSphere</h1>
            <p>Two-Tier Kanban Workflow</p>
          </div>
        </div>

        <div className="status-section">
          <div className={`system-status ${dbStatus === 'DOWN' ? 'down' : ''}`} id="db-health-status">
            <Database className="w-4 h-4" />
            <span>Database:</span>
            <span className="pulse-indicator" style={{ 
              backgroundColor: dbStatus === 'UP' ? '#10b981' : dbStatus === 'DOWN' ? '#ef4444' : '#f59e0b' 
            }}></span>
            <strong>{dbStatus}</strong>
          </div>
          
          <button className="btn-action-icon" onClick={() => { fetchTasks(); checkHealth(); }} title="Refresh Data">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Control Panel */}
      <section className="dashboard-actions">
        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-tasks-input"
            />
          </div>

          <select 
            className="filter-select"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            id="priority-filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            id="category-filter-select"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button className="btn-primary" onClick={handleOpenCreate} id="create-task-btn">
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </section>

      {/* Main Board */}
      <main>
        {loading ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Layers className="w-8 h-8 animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
            <p>Loading your board space...</p>
          </div>
        ) : (
          <KanbanBoard 
            tasks={filteredTasks}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      {/* Create / Edit Modal */}
      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        taskToEdit={editingTask}
      />
    </div>
  );
}

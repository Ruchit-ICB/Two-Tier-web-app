import React from 'react';
import { Edit3, Trash2, Calendar, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const { id, title, description, status, priority, category, due_date } = task;

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPriorityIcon = () => {
    if (priority === 'high') {
      return <AlertTriangle className="w-3.5 h-3.5" />;
    }
    return null;
  };

  // Status progression mapping
  const handleMoveLeft = () => {
    if (status === 'done') onStatusChange(id, 'in-progress');
    else if (status === 'in-progress') onStatusChange(id, 'todo');
  };

  const handleMoveRight = () => {
    if (status === 'todo') onStatusChange(id, 'in-progress');
    else if (status === 'in-progress') onStatusChange(id, 'done');
  };

  // Drag and drop start event
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className={`task-card glass-panel priority-${priority} animate-fade-in`}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="card-header">
        <span className="card-category">{category}</span>
        <div className="card-actions">
          <button 
            className="btn-action-icon edit" 
            onClick={() => onEdit(task)}
            title="Edit Task"
            id={`edit-task-${id}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            className="btn-action-icon delete" 
            onClick={() => onDelete(id)}
            title="Delete Task"
            id={`delete-task-${id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="card-body">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>

      <div className="card-footer">
        <div className="card-date">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(due_date)}</span>
        </div>

        <div className="card-column-transition">
          {status !== 'todo' && (
            <button 
              className="btn-action-icon move-left" 
              onClick={handleMoveLeft}
              title="Move Back"
              id={`move-left-${id}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          
          <div className={`card-priority ${priority}`}>
            {getPriorityIcon()}
            <span>{priority}</span>
          </div>

          {status !== 'done' && (
            <button 
              className="btn-action-icon move-right" 
              onClick={handleMoveRight}
              title="Move Forward"
              id={`move-right-${id}`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

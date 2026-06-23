import React from 'react';
import TaskCard from './TaskCard';
import { Inbox } from 'lucide-react';

export default function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange }) {
  const columns = [
    { id: 'todo', name: 'To Do', className: 'todo' },
    { id: 'in-progress', name: 'In Progress', className: 'inprogress' },
    { id: 'done', name: 'Done', className: 'done' }
  ];

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (taskIdStr) {
      const taskId = parseInt(taskIdStr);
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="board-container">
      {columns.map(column => {
        const columnTasks = tasks.filter(task => task.status === column.id);
        
        return (
          <div 
            key={column.id} 
            className="board-column glass-panel"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-header">
              <div className={`column-title ${column.className}`}>
                <span className="column-dot"></span>
                <h2>{column.name}</h2>
              </div>
              <span className="column-badge">{columnTasks.length}</span>
            </div>

            <div className="column-cards-wrapper">
              {columnTasks.length > 0 ? (
                columnTasks.map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <Inbox className="w-8 h-8" />
                  <p>No tasks in this column</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

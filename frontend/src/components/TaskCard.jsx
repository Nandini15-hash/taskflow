import { useState } from "react";
import TaskForm from "./TaskForm.jsx";

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="task-card">
        <TaskForm
          initialTask={task}
          onCancel={() => setEditing(false)}
          onSubmit={(updates) => {
            onUpdate(task._id, updates);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`task-card priority-${task.priority}`}>
      <div className="task-card-header">
        <h3>{task.title}</h3>
        <span className={`badge status-${task.status}`}>{task.status}</span>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <span className={`badge priority-badge priority-${task.priority}`}>
          {task.priority} priority
        </span>
        {task.dueDate && (
          <span className="due-date">Due {new Date(task.dueDate).toLocaleDateString()}</span>
        )}
      </div>

      {/* Quick status change without opening the full edit form */}
      <select
        value={task.status}
        onChange={(e) => onUpdate(task._id, { status: e.target.value })}
      >
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>

      <div className="task-actions">
        <button className="btn btn-ghost" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

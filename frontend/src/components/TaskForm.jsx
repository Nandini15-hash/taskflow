import { useState } from "react";

// Reusable for both "create a new task" and "edit an existing task":
// if `initialTask` is passed in, the fields start pre-filled and submitting
// calls onSubmit with the merged changes; otherwise it starts blank.
export default function TaskForm({ initialTask, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [status, setStatus] = useState(initialTask?.status || "todo");
  const [priority, setPriority] = useState(initialTask?.priority || "medium");
  const [dueDate, setDueDate] = useState(
    initialTask?.dueDate ? initialTask.dueDate.slice(0, 10) : "" // Date -> "YYYY-MM-DD" for <input type="date">
  );

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ title, description, status, priority, dueDate: dueDate || null });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </label>
      <div className="form-row">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          Due date
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          {initialTask ? "Save changes" : "Add task"}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

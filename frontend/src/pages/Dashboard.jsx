import { useEffect, useState } from "react";
import api from "../api/axios.js";
import TaskForm from "../components/TaskForm.jsx";
import TaskCard from "../components/TaskCard.jsx";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" | "todo" | "in-progress" | "done"

  // Runs once when the Dashboard mounts. An empty dependency array ([])
  // means "don't re-run this on every render, only the first one."
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(newTask) {
    const res = await api.post("/tasks", newTask);
    // Prepend the new task to local state instead of re-fetching everything
    // from the server — feels instant, and saves a network round-trip.
    setTasks((prev) => [res.data, ...prev]);
    setShowForm(false);
  }

  async function handleUpdate(id, updates) {
    const res = await api.put(`/tasks/${id}`, updates);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
  }

  async function handleDelete(id) {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }

  const visibleTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Your tasks</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Close" : "+ New task"}
        </button>
      </div>

      {showForm && (
        <div className="task-card">
          <TaskForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="filter-bar">
        {["all", "todo", "in-progress", "done"].map((f) => (
          <button
            key={f}
            className={`btn btn-ghost ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p className="center-message">Loading tasks...</p>
      ) : visibleTasks.length === 0 ? (
        <p className="center-message">No tasks here yet.</p>
      ) : (
        <div className="task-grid">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

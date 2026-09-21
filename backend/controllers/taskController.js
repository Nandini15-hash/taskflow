const Task = require("../models/Task");

// GET /api/tasks
// Only ever returns tasks owned by the logged-in user (req.user comes from
// the `protect` middleware, which ran before this handler).
async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

// POST /api/tasks
async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      owner: req.user._id,
      title,
      description,
      status,
      priority,
      dueDate,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

// PUT /api/tasks/:id
async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ownership check: even though this task ID is real, make sure it
    // belongs to whoever is making the request — otherwise user A could
    // edit user B's tasks just by guessing an ID.
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this task" });
    }

    Object.assign(task, req.body); // shallow-merge the incoming fields onto the doc
    const updatedTask = await task.save();

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted", id: req.params.id });
  } catch (error) {
    next(error);
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };

const express = require("express");
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Every task route requires a logged-in user, so we apply `protect` to
// the whole router at once instead of repeating it on each line.
router.use(protect);

router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);

module.exports = router;

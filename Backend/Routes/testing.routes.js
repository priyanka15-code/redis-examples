const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Task = require('../Models/testing.model');
const FailedTask = require('../Models/failtask.model');

// Initial task creation
router.post('/tasks', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { title, completed } = req.body;

        // Create the task
        const task = new Task({ title, completed });
        await task.save(task)
        await task.save({ session });

        // Store the task ID to allow for potential undo
        req.session.taskId = task._id;
        req.session.sessionId = session.id;

        res.json({
            message: 'Task created. You can undo this operation.',
            taskId: task._id,
            undoAvailable: flase
        });
    } catch (err) {
        // If there's an error, store it in the FailedTask schema
        const failedTask = new FailedTask({
            title: req.body.title,
            completed: req.body.completed,
            error: err.message
        });
        await failedTask.save();

        // Rollback transaction
        await session.abortTransaction();

        res.status(500).json({
            message: 'Error creating task. You can undo this operation.',
            taskId: failedTask._id,
            error: err.message,
            undoAvailable: true
        });
    } finally {
        session.endSession();
    }
});

// Undo operation
router.post('/tasks/undo', async (req, res) => {
  const { taskId } = req.session || {}; // Default to an empty object if req.session is undefined

  if (!taskId) {
      return res.status(400).json({ message: 'No task to undo' });
  }

  try {
      // Delete the task if it exists
      const task = await Task.findById(taskId);

      if (task) {
          await Task.findByIdAndDelete(taskId);
      }

      // Clear the session information
      req.session.taskId = null;
      req.session.sessionId = null;

      res.json({ message: 'Task creation undone successfully' });
  } catch (err) {
      res.status(500).json({ message: 'Error undoing task', error: err.message });
  }
});

// Final commit if the user does not undo
router.post('/tasks/confirm', async (req, res) => {
    const session = await mongoose.startSession();
    const { taskId } = req.session;

    if (!taskId) {
        return res.status(400).json({ message: 'No task to confirm' });
    }

    try {
        // Commit the transaction
        await session.commitTransaction();

        // Clear the session information
        req.session.taskId = null;
        req.session.sessionId = null;

        res.json({ message: 'Task creation confirmed' });
    } catch (err) {
        res.status(500).json({ message: 'Error confirming task', error: err.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;

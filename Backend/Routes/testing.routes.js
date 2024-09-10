const express = require('express');
const router = express.Router();
const session = require('express-session');
const mongoose = require('mongoose');
const Task = require('../Models/testing.model');
const FailedTask = require('../Models/failtask.model');

// Initial task creation
router.post('/tasks', async (req, res) => {
    const { title, completed } = req.body;
  
    // Check if required fields are provided
    if (!title || typeof completed === 'undefined') {
      return res.status(400).json({ message: 'Title and completed status are required.' });
    }

    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    
    try {
      // Create and save task
      const task = new Task({ title, completed });
      await task.save({ session: mongoSession });
  
      // Store task ID for undo
      req.session.taskId = task._id.toString();  
      req.session.save();  

      res.json({
        message: 'Task created. You can undo this operation.',
        taskId: req.session.taskId,
        undoAvailable: false
      });

      // Commit the transaction
      await mongoSession.commitTransaction();
    } catch (err) {
        // Abort the transaction if an error occurs
        await mongoSession.abortTransaction();

        const failedTask = new FailedTask({
            title: req.body.title,
            completed: req.body.completed,
            error: err.message
        });
        await failedTask.save({ session: mongoSession });

        // Store failed task ID for undo
        req.session.taskId = failedTask._id.toString();  // Convert ObjectId to string
        req.session.save();  //  session is saved
  
        res.status(500).json({
          message: 'Error creating task. You can undo this operation.',
          taskId: req.session.taskId,
          error: err.message,
          undoAvailable: true
        });
    } finally {
        // End the session
        mongoSession.endSession();
    } 
       /*  try {
            // Start the transaction
            mongoSession.startTransaction();
    
            if (completed) {
                // Save task in the Task schema if completed is true
                const task = new Task({ title, completed });
                await task.save({ session: mongoSession });
                
                // Store task ID for undo
                req.session.taskId = task._id.toString();  
                req.session.save();
    
                // Respond with success message
                res.json({
                    message: 'Task created. You can undo this operation.',
                    taskId: req.session.taskId,
                    undoAvailable: false
                });
            } else {
                // Save task in the FailedTask schema if completed is false
                const failedTask = new FailedTask({
                    title,
                    completed,
                    error: 'Task was not completed'
                });
                await failedTask.save({ session: mongoSession });
    
                // Store failed task ID for undo
                req.session.taskId = failedTask._id.toString();
                req.session.save();
    
                // Respond with error message for failed task
                res.json({
                    message: 'Failed task saved. You can undo this operation.',
                    taskId: req.session.taskId,
                    undoAvailable: true
                });
            }
    
            // Commit the transaction
            await mongoSession.commitTransaction();
        } catch (err) {
            // Abort the transaction if an error occurs
            await mongoSession.abortTransaction();
    
            const failedTask = new FailedTask({
                title: req.body.title,
                completed: req.body.completed,
                error: err.message
            });
            await failedTask.save({ session: mongoSession });
    
            // Store failed task ID for undo
            req.session.taskId = failedTask._id.toString();  
            req.session.save();
    
            res.status(500).json({
                message: 'Error creating task. You can undo this operation.',
                taskId: req.session.taskId,
                error: err.message,
                undoAvailable: true
            });
        } finally {
            // End the session
            mongoSession.endSession();
        } */
});

// Undo operation
router.post('/tasks/undo', async (req, res) => {
    const { taskId } = req.body;
  
    if (!taskId) {
        return res.status(400).json({ message: 'No task to undo' });
    }
  
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
  
        await Task.findByIdAndDelete(taskId);
        req.session.taskId = null;  // Clear session after undo
        req.session.save();
  
        res.json({ message: 'Task undone successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error undoing task', error: err.message });
    }
  });
  


module.exports = router;

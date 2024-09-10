const mongoose = require('mongoose');

const failedTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    required: false
  },
  error: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FailedTask = mongoose.model('FailedTask', failedTaskSchema);

module.exports = FailedTask;

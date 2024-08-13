const mongoose = require('mongoose');

const failedRegistrationSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  failureReason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FailedRegistration = mongoose.model('FailedRegistration', failedRegistrationSchema);
module.exports = FailedRegistration;

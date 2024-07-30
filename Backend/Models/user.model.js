const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment');
const { initRedisClient } = require('./redis');

const generateUserId = async () => {
  const redisClient = await initRedisClient();
  const counter = await redisClient.incr('userIdCounter');
  const paddedCounter = String(counter).padStart(5, '0');
  const date = moment().format('YYYYMMDD');
  const time = moment().format('HHmmss');
  const userId = `T${paddedCounter}-${date}-${time}`;
  return userId;
};

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isNew) {
    try {
      this.userId = await generateUserId();
    } catch (err) {
      return next(err);
    }
  }

  next();
});

userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error.message);
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;

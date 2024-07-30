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
  await redisClient.quit();
  return userId;
};

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
});

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password') || user.isNew) {
    try {
      const existingUser = await mongoose.models.User.findOne({ username: user.username });
      if (existingUser) {
        return next(new Error('Username already exists'));
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      if (user.isNew) {
        user.userId = await generateUserId();
      }

      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
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

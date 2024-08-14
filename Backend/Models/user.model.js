const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { generateUserId } = require('./redis');
const FailedRegistration = require('./fail.model');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
  },
  registrationStatus: {
    type: String,
    enum: ['pending', 'success', 'fail'],
    default: 'pending',
  }
});

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password') || user.isNew) {
    try {
      const existingUser = await mongoose.models.User.findOne({ username: user.username });
      if (existingUser) {
        const err = new Error('Username already exists');
        err.registrationStatus = 'fail';
        throw err;
      }
      user.userId = await generateUserId();

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      user.registrationStatus = 'success';  

      next();
    } catch (err) {
      
      const failedUserId = user.userId || await generateUserId();
      try {
        await FailedRegistration.create({
          userId: failedUserId,
          username: user.username,
          email: user.email,
          failureReason: err.message || 'Registration failed during save process'
        });
      } catch (saveError) {
        return next(saveError);
      }

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

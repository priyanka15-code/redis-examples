const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { generateUserId, checkUserInCache, cacheUser } = require('./redis');
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
      const cachedUser = await checkUserInCache(user.username);

      if (cachedUser) {
       /*  if (user.registrationStatus === 'fail') {
          // Store failed registration in a separate collection
          await FailedRegistration.create({
            userId: await generateUserId(),
            username: user.username,
            email: user.email,
            failureReason: 'Registration failed during save process'
          });        
        } */
        throw new Error('Username already exists (from cache)');
        
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      if (user.isNew) {
        user.userId = await generateUserId();
        user.registrationStatus = 'success';
      }

      next();
    } catch (err) {
      user.registrationStatus = 'fail';
        await FailedRegistration.create({
          userId: await generateUserId(),
          username: user.username,
          email: user.email,
          failureReason: 'Registration failed during save process'
        });       
      next(err);
    }
  } else {
    next();
  }
});

/* userSchema.post('save', async function (user, next) {
  try {
    if (user.registrationStatus === 'success') {
      // Cache the user in Redis after successful registration
      await cacheUser(user);
    } else if (user.registrationStatus === 'fail') {
      // Store failed registration in a separate collection
      await FailedRegistration.create({
        userId: await generateUserId(),
        username: user.username,
        email: user.email,
        failureReason: 'Registration failed during save process'
      });
    }
    next();
  } catch (err) {
    return next(err);
  }
});
 */
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error.message);
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;

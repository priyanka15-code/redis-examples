const express = require('express');
const mongoose = require('mongoose');
const { initRedisClient,loginRateLimiter } = require('../Models/redis')
const router = express.Router();
const jwtUtils = require('../Utils/jwt.utils');
const jwt = require('jsonwebtoken');

/* const { generateUserId, storeFailedRegistration, getFailedRegistration } = require('../Models/redis');
 */
const secret = process.env.SECRET_KEY;

module.exports = () => {
  const User = require('../Models/user.model');

  const getExWord = () => new Date().getTime().toString();

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Check login rate limit for this user
      const { blocked, attempts } = await loginRateLimiter(username);
  
      if (blocked) {
        return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
      }
  
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
  
      // Generate token if login successful
      const token = jwtUtils.generateToken(user);
      if (!token) {
        throw new Error('Failed to generate token');
      }
  
      // Clear login attempts after successful login
      const redisClient = await initRedisClient();
      await redisClient.del(`login_attempts:${username}`);
      await redisClient.quit();
  
      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  router.post('/validate-token', (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.json({ valid: false });
    }
    jwt.verify(token, secret, (err) => {
      if (err) {
        return res.json({ valid: false });
      }
      res.json({ valid: true });
    });
  });

   router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    const user = new User({ username, password, email });
    try {
      await user.save();
      res.json({ message: 'User created successfully' });
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(400).json({ message: 'Error creating user', error: err.message });
    }
  }); 
  /* router.post('/register', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    const { username, password, email } = req.body; 
  
    try {
      let userId = await generateUserId();
  
      const failedRegistration = await getFailedRegistration(username, email);
      if (failedRegistration) {
        userId = failedRegistration.userId;
      }
  
      const user = new User({
        userId,
        username,
        password,
        email,
      });
  
      await user.save({ session });
  
      await session.commitTransaction();
      session.endSession();
  
      res.json({ message: 'User created successfully' });
  
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
  
      const userId = await generateUserId();
      await storeFailedRegistration({
        userId,
        username,
        email,
        error: err.message
      });
  
      res.status(400).json({ message: 'Error creating user', error: err.message });
    }
  });
   */

  return router;
};




const express = require('express');
const router = express.Router();
const jwtUtils = require('../Utils/jwt.utils');

module.exports = (redisClient) => {
  const User = require('../Models/user.model');

  const getExWord = () => new Date().getTime().toString();

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const exWord = getExWord();
      const token = jwtUtils.generateToken(user); 
      console.log("Token:  ", token);

      if (!token) {
        throw new Error('Failed to generate token');
      }

      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
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

  return router;
};

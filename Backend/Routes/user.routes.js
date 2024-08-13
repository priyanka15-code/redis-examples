const express = require('express');
const router = express.Router();
const User = require('../Models/user.model');

router.get('/get', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;

    const users = await User.find()
      .skip(page * limit)
      .limit(limit);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});
module.exports = router;

const express = require('express');
const router = express.Router();
const Business = require('../Models/Business.model');

router.post('/register', async (req, res) => {
  const { businessname } = req.body;
  const business = new Business({ businessname });

  try {
    await business.save();
    res.json({ message: 'Business created successfully' });
  } catch (err) {
    console.error('Error creating Business:', err);
    res.status(400).json({ message: 'Error creating business', error: err.message });
  }
});

router.get('/get', async (req, res) => {
    try {
      const business = await Business.find();
      res.json(business);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;

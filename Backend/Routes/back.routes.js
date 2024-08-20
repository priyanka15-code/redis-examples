/* - userId is exist generate serice like 000234-1,000234-2 using redis
- userId is unique so save in data base 
- userId is not given then continue as it is 
- all condition check by redis cach and redis incr method  */


const express = require('express');
const router = express.Router();
const Back = require('../Models/backno.model');
const { initRedisClient } = require('../Models/redis');

let redisClient;
const getRedisClient = () => {
  if (!redisClient) {
    redisClient = initRedisClient();
  }
  return redisClient;
};

router.post('/register', (req, res) => {
  const { userId, username, password, email, business } = req.body;

  const newUser = new Back({
    userId,
    username,
    password,
    email,
    business
  });

  newUser.save()
    .then(() => {
      return getRedisClient()
        .then(client => {
          return client.del(`filterByBusiness:${business}`)
            .then(() => {
              res.status(201).json({ message: 'User registered successfully', user: newUser });
            });
        });
    })
    .catch(err => {
      console.error('Error creating user:', err);
      res.status(400).json({ message: 'Error registering user', error: err.message });
    });
});

router.get('/get', async (req, res) => {
  try {
    const back = await Back.find();
    res.json(back);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;



const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initRedisClient } = require('./Models/redis');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

(async () => {
  try {
    const redisClient = await initRedisClient();

    
const User = require('./Models/user.model')(redisClient);
   const authRoute = require('./Routes/auth.routes')(redisClient);
    const userRoute = require('./Routes/user.routes');

    app.use('/api/auth', authRoute);
    app.use('/api/users', userRoute);

    await mongoose.connect('mongodb://localhost:27017/testing', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error('Error initializing Redis client:', err);
  }
})();

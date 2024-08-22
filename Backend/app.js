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
    await mongoose.connect('mongodb://localhost:27017/testing?retryWrites=true', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    const redisClient = await initRedisClient();
    console.log('Redis client initialized');

    const authRoute = require('./Routes/auth.routes')(redisClient);
    const userRoute = require('./Routes/user.routes');
    const businessRoute = require('./Routes/business.routers');
    const mergeRoute = require('./Routes/mergerequest.router');
    const backRoute = require('./Routes/back.routes')
     const testRoute = require('./Routes/testing.routes')
 /*     const translateRoute = require('./Routes/translate.routes');
 */
    app.use('/api/auth', authRoute);
    app.use('/api/users', userRoute);
    app.use('/api/business', businessRoute);
    app.use('/api/merge',mergeRoute);
    app.use('/api/back',backRoute);
     app.use('/api/test',testRoute)
 /*     app.use('/api/translate',translateRoute)
 */

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (err) {
    console.error('Error initializing services:', err);
  }
})();

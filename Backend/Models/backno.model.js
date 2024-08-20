const mongoose = require('mongoose');
const {  initRedisClient } = require('./redis');

const backSchema = new mongoose.Schema({
  UBID: {
    type: String,
    unique: true,
    sparse: true 
  },
  userId: {
    type: String,
   default: '',
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
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  }
});


backSchema.pre('save', async function (next) {
  const redisClient = await initRedisClient();

  
    try {
      if (!this.userId || this.userId.trim() === '') {
          this.userId = ''; 
          
      } else {
          const existingUser = await redisClient.get(`userId:${this.business}:${this.userId}`);
          if (existingUser) {
              let suffix = await redisClient.incr(`userIdSuffix:${this.business}:${this.userId}`);
              this.userId = `${this.userId}-${suffix}`;
          }
          await redisClient.set(`userId:${this.business}:${this.userId}`, '1');
      }

      next();
  } catch (err) {
    next(err);
  } finally {
    await redisClient.quit();
  }
});

  


const Back = mongoose.model('Back', backSchema);
module.exports = Back;

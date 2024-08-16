const mongoose = require('mongoose');
const { generateUId, initRedisClient } = require('./redis');

const backSchema = new mongoose.Schema({
  UBID: {
    type: String,
    unique: true,
    sparse: true 
  },
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
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  }
});

backSchema.pre('save', async function (next) {
    const redisClient = await initRedisClient();
  
    try {
      // If no userId is provided, generate a new one
      if (!this.userId) {
        this.userId = await generateUId(this.business);
  
        
        if (!this.userId) {
          throw new Error('Failed to generate a valid userId');
        }
      } else {
        const existingUser = await redisClient.get(`userId:${this.userId}`);
        if (existingUser) {
          let suffix = await redisClient.incr(`userIdSuffix:${this.userId}`);
          this.userId = `${this.userId}-${suffix}`;
        }
      }
  
      // Store the userId in Redis to ensure uniqueness across all sessions
      await redisClient.set(`userId:${this.userId}`, '1');
  
      next();
    } catch (err) {
      next(err);
    } finally {
      await redisClient.quit();
    }
  });
  


const Back = mongoose.model('Back', backSchema);
module.exports = Back;

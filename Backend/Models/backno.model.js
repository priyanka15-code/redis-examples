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
    unique: function() {
      return this.userId !== '';
    }
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
backSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { userId: { $ne: '' } } });


backSchema.pre('save', async function (next) {
  const redisClient = await initRedisClient();

  try {
    
    if (this.userId && this.userId.trim() !== '') {
      
      const existingUser = await redisClient.get(`userId:${this.userId}`);
      if (existingUser) {
        
        let suffix = await redisClient.incr(`userIdSuffix:${this.userId}`);
        this.userId = `${this.userId}-${suffix}`;
      }
      
      await redisClient.set(`userId:${this.userId}`, '1');
    }else {
      
      console.log('userId is blank or undefined, skipping Redis operations.');
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

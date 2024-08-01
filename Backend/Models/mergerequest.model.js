const mongoose = require('mongoose');
const { generateUserId, generateUBId } = require('./redis');

const mergeSchema = new mongoose.Schema({
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

mergeSchema.pre('save', async function (next) {
  const merge = this;

  if (merge.isNew) {
    try {
      const existingUser = await mongoose.models.Merge.findOne({
        username: merge.username,
        business: merge.business
      });

      if (existingUser) {
        return next(new Error('User with the same username and business already exists'));
      }

      if (!merge.userId) {
        merge.userId = await generateUserId(merge.business.toString());
      }

      if (!merge.UBID) {
        merge.UBID = await generateUBId();
      }

      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
});mergeSchema.pre('save', async function (next) {
    const merge = this;
    const maxRetries = 5; 
    let retryCount = 0;
  
    const saveWithRetries = async () => {
      if (merge.isNew) {
        try {
          const existingUser = await mongoose.models.Merge.findOne({
            username: merge.username,
            business: merge.business
          });
  
          if (existingUser) {
            return next(new Error('User with the same username and business already exists'));
          }
  
          if (!merge.userId) {
            merge.userId = await generateUserId(merge.business.toString());
          }
  
          if (!merge.UBID) {
            merge.UBID = await generateUBId();
          }
  
          await merge.save();
          next();
        } catch (err) {
          if (err.code === 11000 && retryCount < maxRetries) { 
            retryCount++;
            console.warn(`Duplicate key error encountered. Retrying ${retryCount}/${maxRetries}...`);
            merge.userId = await generateUserId(merge.business.toString()); 
            await saveWithRetries();
          } else {
            return next(err);
          }
        }
      } else {
        next();
      }
    };
  
    saveWithRetries();
  });
  

const Merge = mongoose.model('Merge', mergeSchema);
module.exports = Merge;

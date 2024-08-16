const mongoose = require('mongoose');
const { generateUBId, generateUId } = require('./redis');

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
  const maxRetries = 5;
  let retryCount = 0;

  const generateUId = async () => {
    if (retryCount >= maxRetries) {
      return next(new Error(`Failed to generate unique userId after ${maxRetries} retries`));
    }

    try {
      
      if (!merge.userId) {
        merge.userId = await generateUId(merge.business.toString());

          const existingUser = await mongoose.models.Merge.findOne({
          business: merge.business,
          userId: merge.userId
        });

        if (existingUser) {
            retryCount++;
          merge.userId = await generateUId(merge.business.toString(), `-${retryCount.toString().padStart(2, '0')}`);
          await generateUId();  
        }
      }

           if (!merge.UBID) {
        merge.UBID = await generateUBId();
      }

      next();
    } catch (err) {
      if (err.code === 11000) {
               retryCount++;
        console.warn(`Duplicate key error encountered. Retrying ${retryCount}/${maxRetries}...`);
        merge.userId = await generateUId(merge.business.toString(), `-${retryCount.toString().padStart(2, '0')}`);
        await generateUId();  
      } else {
        next(err);
      }
    }
  };

  if (merge.isNew) {
    await generateUId();
  } else {
    next();
  }
});


const Merge = mongoose.model('Merge', mergeSchema);
module.exports = Merge;





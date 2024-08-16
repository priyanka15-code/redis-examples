const express = require('express');
const mongoose = require('mongoose'); 
const router = express.Router();
const Merge = require('../Models/mergerequest.model');
const Business = require('../Models/Business.model');
const Back = require('../Models/backno.model')
const { generateUserId, initRedisClient } = require('../Models/redis');  

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && (id.length === 24 || id.length === 12);

let redisClient;
const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = await initRedisClient();
  }
  return redisClient;
};

router.post('/register', async (req, res) => {
  const { username, password, email, business: businessId, userId } = req.body;

  if (!isValidObjectId(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID format' });
  }

  const foundBusiness = await Business.findById(businessId);

  if (!foundBusiness) {
      return res.status(400).json({ message: 'Business does not exist' });
  }

  const finalUserId = userId || await generateUserId(businessId);

  const newMerge = new Merge({
      username,
      password,
      email,
      business: foundBusiness._id,
      userId: finalUserId  
  });

  try {
      await newMerge.save();

      
      const client = await getRedisClient();
      await client.del(`filterByBusiness:${businessId}`);
      
      res.json({ message: 'User created successfully', finalUserId });
  } catch (err) {
      console.error('Error creating user:', err);
      res.status(400).json({ message: 'Error creating user', error: err.message });
  }
});

router.get('/get', async (req, res) => {
    try {
      const merge = await Merge.find();
      res.json(merge);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
});

const cacheMiddleware = async (req, res, next) => {
  const { businessId } = req.params;

  try {
    const client = await getRedisClient();
    const cachedData = await client.get(`filterByBusiness:${businessId}`);

    if (cachedData) {
      console.log('Cache hit!');
      return res.json(JSON.parse(cachedData));
    }

    next(); 
  } catch (error) {
    console.error('Cache middleware error:', error);
    next();
  }
};

router.get('/filterByBusiness/:businessId', cacheMiddleware, async (req, res) => {
  const { businessId } = req.params;
  console.log('Route hit with businessId:', req.params.businessId);

  try {
    if (!isValidObjectId(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID format' });
    }

    const pipeline = [
      {
        $match: { business: mongoose.Types.ObjectId(businessId) },
      },
      {
        $lookup: {
          from: 'businesses',
          localField: 'business',
          foreignField: '_id',
          as: 'businessDetails',
        },
      },
      {
        $unwind: {
          path: '$businessDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          username: 1,
          email: 1,
          userId: 1,
          UBID: 1,
          businessname: '$businessDetails.businessname',
        },
      },
    ];
  
    const mergePromise = Merge.aggregate(pipeline);
    const backPromise = Back.find({ business: mongoose.Types.ObjectId(businessId) });

    Promise.all([mergePromise, backPromise])
      .then(([mergeResults, backResults]) => {
        const combinedResults = [...mergeResults, ...backResults];
        return getRedisClient()
          .then(client => {
            return client.setEx(`filterByBusiness:${businessId}`, 900, JSON.stringify(combinedResults))
              .then(() => {
                res.json(combinedResults);
              });
          });
      })
      .catch(err => {
        console.error('Error fetching filtered data:', err);
        res.status(500).json({ message: 'Error fetching data', error: err.message });
      });
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});
  

module.exports = router;

const express = require('express');
const mongoose = require('mongoose'); 
const router = express.Router();
const Merge = require('../Models/mergerequest.model');
const Business = require('../Models/Business.model');
const { generateUserId } = require('../Models/redis');  

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && (id.length === 24 || id.length === 12);

router.post('/register', async (req, res) => {
    const { username, password, email, business: businessId, userId } = req.body;

    try {
        console.log('Querying Business with ID:', businessId);

        if (!isValidObjectId(businessId)) {
            return res.status(400).json({ message: 'Invalid business ID format' });
        }

        const foundBusiness = await Business.findById(businessId);

        console.log('Found Business:', foundBusiness);

        if (!foundBusiness) {
            return res.status(400).json({ message: 'Business does not exist' });
        }

  // Generate userId if not provided
  const finalUserId = userId || await generateUserId(businessId);

        const newMerge = new Merge({
            username,
            password,
            email,
            business: foundBusiness._id,
            userId: finalUserId  
        });

        await newMerge.save();
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

  router.get('/filterByBusiness/:businessId', async (req, res) => {
    const { businessId } = req.params;

    try {
        if (!isValidObjectId(businessId)) {
            return res.status(400).json({ message: 'Invalid business ID format' });
        }

        const pipeline = [
            {
                $match: { business: mongoose.Types.ObjectId(businessId) }
            },
            {
                $lookup: {
                    from: 'businesses', 
                    localField: 'business',
                    foreignField: '_id',
                    as: 'businessDetails'
                }
            },
            {
                $unwind: {
                    path: '$businessDetails',
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $project: {
                    _id: 0,
                    username: 1,
                    email: 1,
                    userId: 1,
                    UBID: 1,
                    businessName: '$businessDetails.businessname'
                }
            }
        ];

        const results = await Merge.aggregate(pipeline);

        res.json(results);
    } catch (err) {
        console.error('Error fetching filtered data:', err);
        res.status(500).json({ message: 'Error fetching data', error: err.message });
    }
});


module.exports = router;

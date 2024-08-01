const mongoose = require('mongoose');
const { generateBusinessId } = require('./redis');

const BusinessSchema = new mongoose.Schema({
  businessId: {
    type: String,
    unique: true
  },
  businessname: {
    type: String,
    required: true,
  },
});

BusinessSchema.pre('save', async function (next) {
  const business = this;

  try {
    const existingBusiness = await mongoose.models.Business.findOne({ businessname: business.businessname });
    if (existingBusiness) {
      return next(new Error('Businessname already exists'));
    }

    if (business.isNew) {
      business.businessId = await generateBusinessId();
    }

    next();
  } catch (err) {
    return next(err);
  }
});

const Business = mongoose.model('Business', BusinessSchema);
module.exports = Business;

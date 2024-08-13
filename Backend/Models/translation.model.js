const mongoose = require('mongoose');

const translationSchema = mongoose.Schema({
  keyword: { type: String, required: true },
  translations: {
    english: { type: String, required: true },
    french: { type: String, required: true },
    dutch: { type: String, required: true }
  }
});

module.exports = mongoose.model('Translation', translationSchema);

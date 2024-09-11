const mongoose = require('mongoose');

const undouserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    successCounter: { type: Number, default: 0 },
    failCounter: { type: Number, default: 0 }
});

const Undo = mongoose.model('Undo', undouserSchema);
module.exports = Undo;
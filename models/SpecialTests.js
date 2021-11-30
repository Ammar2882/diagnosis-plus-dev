const mongoose = require('mongoose');

const specialTestsSchema = new mongoose.Schema({
    bodyPart: {
        type: String,
        required: true
    },
    tests: {
        type: [String],
        required: true
    }
});

module.exports = mongoose.model('SpecialTests', specialTestsSchema);
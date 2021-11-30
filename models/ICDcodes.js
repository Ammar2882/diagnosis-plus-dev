const mongoose = require("mongoose")

const ICDcodeschema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('ICDcodes', ICDcodeschema);
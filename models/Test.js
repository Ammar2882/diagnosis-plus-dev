const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    frontPhoto: {
        type: String
    },
    backPhoto: {
        type: String
    },
    surgicalHistory: {
        type: [{
            desc: {
                type: String,
                required: [true, 'Please add description of the photo you are uploading']
            },
            url: {
                type: String,
                required: [true,'Please add url of the photo you are uploading']
            }
        }],
        required: false
    }
});

module.exports = mongoose.model('Test', testSchema);
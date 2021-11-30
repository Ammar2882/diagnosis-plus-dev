const mongoose = require('mongoose')

const medicalConditionsSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    NF_EXCL: {
        type: String
    }

})

module.exports = mongoose.model('OtherMedConditions', medicalConditionsSchema);
const mongoose = require('mongoose')

const pharmaSchema = new mongoose.Schema({
    Name: {
        type: String
    },
    Address: {
        type: String
    },
    Email: {
        type: String
    },
    Phone: {
        type: String
    }
})

module.exports = mongoose.model('Pharmacies', pharmaSchema);
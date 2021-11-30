const mongoose = require('mongoose');

const allTreatmentPlans = mongoose.Schema({
    type: [String]
})

module.exports = mongoose.model('allTreatmentPlans', allTreatmentPlans);
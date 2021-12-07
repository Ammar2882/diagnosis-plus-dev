const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    labs : [String]
});

module.exports = mongoose.model('Lab', labSchema);
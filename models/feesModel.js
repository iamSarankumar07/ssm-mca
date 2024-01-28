const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    totalFee: {
        type: Number,
        required: true
    },
    pendingFee: {
        type: Number,
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('student fees', studentSchema);
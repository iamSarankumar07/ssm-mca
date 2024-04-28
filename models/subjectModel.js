const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('Subject', subjectSchema);
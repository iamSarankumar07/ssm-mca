const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    fatherName: {
        type: String,
        required: false,
    },
    gender: {
        type: String,
        required: false,
    },
    dob: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false
    },
    previousQualification: {
        type: String,
        required: false
    },
    program: {
        type: String,
        required: false
    },
    tenthMarks: {
        type: String,
        required: false
    },
    twelfthMarks: {
        type: String,
        required: false
    },
    ugPercentage: {
        type: String,
        required: false
    },
    emergencyContact: {
        type: String,
        required: false
    },
    emergencyPhone: {
        type: String,
        required: false
    },
    refNo: {
        type: String,
        required: false
    },
    appliedDate: {
        type: String,
        required: false
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    }
});

module.exports = mongoose.model('admission', admissionSchema);

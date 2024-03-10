const mongoose = require('mongoose');
const moment = require('moment');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    registerNumber: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    dob: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    studentId: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    totalFee: {
        type: Number,
        required: false
    },
    pendingFee: {
        type: Number,
        required: false
    },
    paymentStatus: {
        type: String,
        required: false
    },
    examTotalFee: {
        type: Number,
        required: false
    },
    examPendingFee: {
        type: Number,
        required: false
    },
    examPaymentStatus: {
        type: String,
        required: false
    },
    tutionDueDate: {
        type: String,
        required: false
    },
    examDueDate: {
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

module.exports = mongoose.model('students', studentSchema);

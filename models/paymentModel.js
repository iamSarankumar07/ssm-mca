const mongoose = require('mongoose');

const paymentsSchema = new mongoose.Schema({
    txnId: {
        type: String,
        required: false,
    },
    amount: {
        type: Number,
        required: false
    },
    currency: {
        type: String,
        required: false
    },
    paymentStatus: {
        type: String,
        required: false,
    },
    paymentType: {
        type: String,
        required: false,
    },
    paymentMode: {
        type: String,
        required: false,
    },
    paymentGateway: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    receipt_url: {
        type: String,
        required: false,
    },
    studentId: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    course: {
        type: String,
        required: false,
    },
    year: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    txnDate: {
        type: Date,
        required: false,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    }
});

module.exports = mongoose.model('payments', paymentsSchema);

const mongoose = require('mongoose');

const Loginschema = new mongoose.Schema({

    staffId: {
        type: String,
        required: false
    },
    name: {
        type:String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    },
    token: {
        type: String
    },
    otp: {
        type: String,
        required: false
    },
    forgotOtp: {
        type: String,
        required: false
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    }
});

  

module.exports = mongoose.model('Admin', Loginschema)

const mongoose = require('mongoose');

const Loginschema = new mongoose.Schema({

    userName: {
        type: String,
        required:false
    },
    name: {
        type:String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
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
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    }
});

  

module.exports = mongoose.model('Admin', Loginschema)

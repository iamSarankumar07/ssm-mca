const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    message: {
        title: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        }
    },
    isActive: {
        type: Boolean,
        required: false,
    },
    readStatus: {
        type: Boolean,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: false,
    }
});

module.exports = mongoose.model('notifications', NotificationSchema);
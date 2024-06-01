const mongoose = require("mongoose");

const TemplateSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
        required: false,
    }
});

module.exports = mongoose.model('Template', TemplateSchema);


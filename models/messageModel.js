const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderName: String,
    message: String,
    type: { type: String, enum: ["message", "join", "leave"], default: "message" },
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderName: String,
    senderId: String,
    year: String,
    message: String,
    course: String,
    isAdmin: String,
    type: { type: String, enum: ["message", "join", "leave"], default: "message" },
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
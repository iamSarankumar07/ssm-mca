const mongoose = require("mongoose");

const chatBotSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatBot = mongoose.model("Chatbot", chatBotSchema);

module.exports = ChatBot;

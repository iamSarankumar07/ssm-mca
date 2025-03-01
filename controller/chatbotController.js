const studentModel = require("../models/studentModel");
const adminModel = require("../models/adminModel");
const chatbotModel = require("../models/chatbotModel");
const axios = require("axios");
const mongoose = require("mongoose")

exports.getStudentChatbot = async (req, res) => {
    try {
        let {user} = req.params;
        let userData = await studentModel.findOne({ _id: user });
        res.render('chatbot', { userData });
    } catch (err) {
        console.log("Error in getStudentChatbot: " + err)
        res.send("Internal Server Error")
    }
};

exports.getAdminChatbot = async (req, res) => {
    try {
        let {user} = req.params;
        let userData = await adminModel.findOne({ _id: user });
        res.render('chatbot', { userData });
    } catch (err) {
        res.send("Internal Server Error")
    }
};

exports.chatbot = async (req, res) => {
    const { user, message } = req.body;
    try {

        const response = await axios.post(
            process.env.MISTRAL_AI_URL,
            {
                model: "mistral-small-latest",
                messages: [{ role: "user", content: message }],
                max_tokens: 100,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
                    "Content-Type": "application/json",
                }
            }
        );

        const botReply = response.data.choices[0].message.content;

        await chatbotModel.create({ user, message, response: botReply });

        res.json({ reply: botReply });

    } catch (err) {
        console.error("Mistral AI Chatbot Error:", err);
        const botReply = "Internal Server Error!";
        // res.status(500).json({ error: "Failed to communicate with chatbot" });
        await chatbotModel.create({ user, message, response: botReply });
        res.json({ reply: botReply });
    }
};

exports.chatbotHistory = async (req, res) => {
    try {
        const chats = await chatbotModel.find({ user: req.params.user }).sort({ timestamp: -1 }).limit(50);
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: "Error fetching chat history" });
    }
}


module.exports = exports;
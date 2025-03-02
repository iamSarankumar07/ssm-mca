const studentModel = require("../models/studentModel");
const adminModel = require("../models/adminModel");
const chatbotModel = require("../models/chatbotModel");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");


exports.getStudentChatbot = async (req, res) => {
    try {
        let { user } = req.query;

        let userData = await studentModel.findOne({ _id: user });

        const chats = await chatbotModel.find({ user })
            .sort({ timestamp: -1 })
            .limit(50);

        res.render('chatbot', { userData, chats });
    } catch (err) {
        console.error("Error in getStudentChatbot:", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.getAdminChatbot = async (req, res) => {
    try {
        let { user } = req.query;

        let userData = await adminModel.findOne({ _id: user });
        
        const chats = await chatbotModel.find({ user })
            .sort({ timestamp: -1 })
            .limit(50);

        res.render('chatbot', { userData, chats });
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

exports.googleAiChatbot = async (req, res) => {
    const { user, message } = req.body;
    try {
        const { user, message } = req.body;

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = message;

        const result = await model.generateContent(prompt);
        let botReply = result.response.text();

        // const response = await axios.post(
        //     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", // gemini-1.5-flash
        //     {
        //         contents: [{ role: "user", parts: [{ text: message }] }]
        //     },
        //     {
        //         headers: { "Content-Type": "application/json" },
        //         params: { key: process.env.GOOGLE_API_KEY }
        //     }
        // );

        // const botReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond.";

        const chatEntry = new chatbotModel({ user, message, response: botReply });
        await chatEntry.save();

        res.json({ reply: botReply });

    } catch (error) {
        console.error("google AI Chatbot Error:", error);
        const botReply = "Internal Server Error!";
        // res.status(500).json({ error: "Failed to communicate with chatbot" });
        await chatbotModel.create({ user, message, response: botReply });
        res.json({ reply: botReply });
    }
};

exports.chatbotHistory = async (req, res) => {
    try {
        const { user } = req.params;
        const { before } = req.query;

        let query = { user };
        if (before) {
            query.timestamp = { $lt: new Date(before) };
        }

        const chats = await chatbotModel.find(query)
            .sort({ timestamp: -1 })
            .limit(50);

        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: "Error fetching chat history" });
    }
};


module.exports = exports;
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

        console.log(botReply);

        const chatEntry = new chatbotModel({ user, message, response: botReply });
        await chatEntry.save();
        
        res.json({ reply: botReply });
        
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

exports.jobs = async (req, res) => {
    try {
        res.render("jobs")
    } catch (error) {
        console.error("Error fetching job listings:", error);
        res.status(500).send("Failed to load job listings.");
    }
};

exports.jobSearch = async (req, res) => {
    try {
        const { query, location } = req.query;
        
        const response = await axios.get(`https://jsearch.p.rapidapi.com/search`, {
            params: { query: query, location: location },
            headers: {
                "X-RapidAPI-Key": process.env.JOB_API_KEY,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching job search results:", error.message);
        res.status(500).json([]);
    }
};

exports.getNews = async (req, res) => {
    try {
        res.render("news");
    } catch (err) {
        console.log("Error in getScholarships: " + err)
    }
};

exports.getEducationNews = async (req, res) => {
    try {
        // const url = process.env.NEWS_API_DOMAIN +  `/v2/top-headlines?category=education&country=in&apiKey=${process.env.NEWS_API_KEY}`;
        // const url = `https://newsapi.org/v2/everything?q=education&apiKey=${process.env.NEWS_API_KEY}`;

        // const indiaRes = await axios.get(`https://newsapi.org/v2/top-headlines?country=in&apiKey=${process.env.NEWS_API_KEY}`);
        const tamilRes = await axios.get(`https://newsapi.org/v2/everything?q="Tamil Nadu"&language=en&apiKey=${process.env.NEWS_API_KEY}`);

        // const response = await axios.get(url);
        const newsArticles = tamilRes.data.articles;

        res.json(newsArticles)

        // res.render("news", { news: newsArticles });
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).send("Failed to load news.");
    }
};



module.exports = exports;
const express = require('express');
const path = require("path");
const app = express();
const authonticationController = require("../middleware/auth");
const chatBotController = require("../controller/chatbotController");

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.get("/student/getChatBot/:user",
    authonticationController.sValidateToken,
    chatBotController.getStudentChatbot
);

app.get("/admin/getChatBot/:user",
    authonticationController.validateToken,
    chatBotController.getAdminChatbot
);

app.post("/chatbot",
    // authonticationController.sValidateToken,
    chatBotController.chatbot
);

app.get("/chatbot/history/:user",
    // authonticationController.sValidateToken,
    chatBotController.chatbotHistory
);


module.exports = app;

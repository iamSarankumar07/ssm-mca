const express = require('express');
const path = require("path");
const app = express();
const authonticationController = require("../middleware/auth");
const chatController = require("../controller/chatController");

app.set("view engine", "ejs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.get("/chatroom",
    authonticationController.sValidateToken,
    chatController.getChatroom
);

module.exports = app;
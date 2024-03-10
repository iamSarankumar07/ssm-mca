const express = require("express");
const app = express();
const studentController = require("../controller/announcementController");
const announcementController = require("../controller/announcementController");
const authFile = require("../middleware/auth");

app.get("/sendMail", authFile.validateToken, studentController.sendMail);

app.post("/sendMailById", authFile.validateToken, announcementController.sendEmailByRegNum);

app.post("/commonAnnouncement", authFile.validateToken, announcementController.commonMail);

module.exports = app;

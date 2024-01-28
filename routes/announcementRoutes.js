const express = require("express");
const app = express();
const studentController = require("../controller/announcementController");

app.get('/sendMail', studentController.sendMail)

module.exports = app;
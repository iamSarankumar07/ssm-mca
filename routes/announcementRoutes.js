const express = require("express");
const app = express();
const studentController = require("../controller/announcementController");
const announcementController = require('../controller/announcementController');

app.get('/sendMail', studentController.sendMail);

app.post('/sendMailById', announcementController.sendEmailByRegNum);

app.post('/sendMailFirstYear', announcementController.firstYearMail);

app.post('/sendMailSecondYear', announcementController.secondYearMail);

module.exports = app;

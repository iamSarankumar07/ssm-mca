const express = require("express");
const app = express();
const studentController = require("../controller/announcementController");
const announcementController = require('../controller/announcementController');

app.get('/sendMail', studentController.sendMail);

app.post('/sendMailById', announcementController.sendEmailByRegNum);

app.get('/sendMailFirstYear', announcementController.firstYearMail);

app.get('/sendMailSecondYear', announcementController.secondYearMail);

module.exports = app;

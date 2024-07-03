const express = require("express");
const app = express();
const studentController = require("../controller/announcementController");
const announcementController = require("../controller/announcementController");
const authonticationController = require("../middleware/auth");

app.get(
  "/sendMail",
  authonticationController.validateToken,
  studentController.sendMail
);

app.post(
  "/sendMailById",
  authonticationController.validateToken,
  announcementController.sendEmailByRegNum
);

app.post(
  "/commonAnnouncement",
  authonticationController.validateToken,
  announcementController.commonMail
);

app.post(
  "/paymentAlert",
  authonticationController.validateToken,
  announcementController.sendPaymentAlert
);

module.exports = app;

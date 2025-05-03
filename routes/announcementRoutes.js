const express = require("express");
const app = express();
const announcementController = require("../controller/announcementController");
const authonticationController = require("../middleware/auth");

app.get(
  "/sendMail",
  authonticationController.validateToken,
  announcementController.sendMail
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

app.get(
  "/notifications",
  authonticationController.validateToken,
  (req, res, next) => {
    const page = req.query.page;
    const limit = req.query.limit;
    const userId = req.query.userId;

    req.body.page = page;
    req.body.limit = limit;
    req.body.userId = userId;
    next();
  },
  announcementController.fetchNotifications
);

app.post(
  "/notifications/markAllRead",
  authonticationController.validateToken,
  announcementController.updateNotificationStatus
);

app.post(
  "/notifications/:notificationId/markAsRead",
  authonticationController.validateToken,
  announcementController.updateNotificationStatusById
);

app.get(
  "/getNotificationCount",
  announcementController.getNotificationCount
);

module.exports = app;

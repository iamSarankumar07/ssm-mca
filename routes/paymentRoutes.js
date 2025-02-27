const express = require('express');
const path = require("path");
const app = express();
const authonticationController = require("../middleware/auth");
const paymentController = require("../controller/paymentController");

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.post(
    "/createPaymentStripe",
    authonticationController.sValidateToken,
    paymentController.createPaymentStripe
);

app.get('/paymentsList', 
    authonticationController.validateToken,
    paymentController.getPayments
);

app.get("/chatroom",
    authonticationController.sValidateToken,
    paymentController.getChatroom
);

app.get("/adminChatroom",
    authonticationController.validateToken,
    paymentController.getAdminChatroom
);

app.post("/deleteMessage",
    authonticationController.validateToken,
    paymentController.deleteMessage
);

module.exports = app;

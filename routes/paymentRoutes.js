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

app.get('/getPayments', 
    authonticationController.validateToken,
    paymentController.getPayments
);

app.get('/getTransactionsData', 
    authonticationController.validateToken,
    paymentController.getTransactionsData
);

app.get('/getTransactionsDataById/:txnId', 
    authonticationController.validateToken,
    paymentController.getTransactionsDataById
);

app.get("/chatroom",
    authonticationController.sValidateToken,
    paymentController.getChatroom
);

app.get("/getAdminChatroom",
    authonticationController.validateToken,
    (req, res, next) => {
        const course = req.query.course;
        const year = req.query.year
    
        req.body.course = course;
        req.body.year = year;
        next();
    },
    paymentController.getAdminChatroom
);

app.delete("/delete-message/:id",
    authonticationController.validateToken,
    paymentController.deleteMessage
);

module.exports = app;

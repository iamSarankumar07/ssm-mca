const express = require('express');
const path = require("path");
const app = express();
const authonticationController = require("../middleware/auth");
const razorPayController = require("../controller/razorPayController");


app.set("view engine", "ejs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.get(
  "/tuitionCreatePaymentRazor",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  razorPayController.getTuitionCreatePaymentRazor
);

app.get(
  "/examCreatePaymentRazor",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  razorPayController.getExamCreatePaymentRazor
);

app.post("/createRazorPayPayment", 
    authonticationController.sValidateToken,
    razorPayController.createOrder
);

app.post("/verifyRazorPaySignature", 
    authonticationController.sValidateToken,
    razorPayController.verifyAndSavePayment
);

app.get('/paymentSuccessRazorPay', 
    // authonticationController.sValidateToken,
    razorPayController.paymentSuccessRazorPay
);


module.exports = app;

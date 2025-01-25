const express = require('express');
const path = require("path");
const app = express();
const authonticationController = require("../middleware/auth");
const advancePaymentController = require("../controller/advancePaymentController");


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
  advancePaymentController.getTuitionCreatePaymentRazor
);

app.get(
  "/examCreatePaymentRazor",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  advancePaymentController.getExamCreatePaymentRazor
);

app.post("/createRazorPayPayment",
  authonticationController.sValidateToken,
  advancePaymentController.createRazorPayPayment
);

app.post("/verifyRazorPaySignature",
  authonticationController.sValidateToken,
  advancePaymentController.verifyAndSavePayment
);

app.get('/paymentSuccessRazorPay',
  // authonticationController.sValidateToken,
  advancePaymentController.paymentSuccessRazorPay
);

app.get(
  "/tuitionCreatePaymentPaypal",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  advancePaymentController.getTuitionCreatePaymentPaypal
);

app.get(
  "/examCreatePaymentPaypal",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  advancePaymentController.getExamCreatePaymentPaypal
);

app.post("/createPaypalPayment", 
  // authonticationController.sValidateToken,
  advancePaymentController.createPaypalPayment
);

app.post("/capturePaypalPayment", 
  // authonticationController.sValidateToken,
  advancePaymentController.capturePaypalPayment
);




module.exports = app;

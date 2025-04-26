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
  "/createRazorPayPaymentByMail",
  (req, res, next) => {
    const studentId = req.query.studentId;
    const signature = req.query.signature;
    const paymentType = req.query.paymentType;

    req.body.studentId = studentId;
    req.body.signature = signature;
    req.body.paymentType = paymentType;
    req.headers["signature"] = req.headers["signature"] || signature;
    next();
  },
  authonticationController.validateHeaderSignature,
  advancePaymentController.createRazorPayPaymentByMail
);

app.post("/payFromEmail",
  authonticationController.validateHeaderSignature,
  advancePaymentController.payFromEmail
);

app.post("/verifyRazorPaySignatureForEmail",
  authonticationController.validateHeaderSignature,
  advancePaymentController.verifyAndSavePayment
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
  authonticationController.sValidateToken,
  advancePaymentController.createPaypalPayment
);

app.post("/capturePaypalPayment", 
  authonticationController.sValidateToken,
  advancePaymentController.capturePaypalPayment
);

app.get(
  "/tuitionCreatePaymentCashFree",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  advancePaymentController.getTuitionCreatePaymentCashFree
);

app.get(
  "/examCreatePaymentCashFree",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  advancePaymentController.getExamCreatePaymentCashFree
);

app.post("/createCashfreePayment", 
  authonticationController.sValidateToken,
  advancePaymentController.createCashfreePayment
);

app.get("/getCashfreeStatus", 
  // authonticationController.sValidateToken,
  advancePaymentController.getCashfreeStatus
);

app.post("/webhook", (req, res) => {
  const webhookData = req.body
  console.log("Received webhook:", webhookData)
  res.sendStatus(200)
});

app.get(
  "/stripeTuitionPaymentEJS",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  advancePaymentController.stripeTuitionPaymentEJS
);

app.get(
  "/stripeExamPaymentEJS",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  advancePaymentController.stripeExamPaymentEJS
);

app.post("/createStripePaymentEJS", 
  authonticationController.sValidateToken,
  advancePaymentController.createStripePaymentEJS
);

app.post("/stripe/webhook",
  express.raw({ type: 'application/json' }),
  advancePaymentController.handleStripeWebhook
);

app.get("/getStripeStatus", 
  // authonticationController.sValidateToken,
  advancePaymentController.stripePaymentResponse
);

app.get("/employee/getSingleSalary",
  authonticationController.validateToken,
  advancePaymentController.getEmployeeSingleSalaryList
);

app.get("/employee/getSalaryData",
  authonticationController.validateToken,
  advancePaymentController.getSalaryData
);

app.get("/employee/getBulkSalary",
  authonticationController.validateToken,
  advancePaymentController.getEmployeeBulkSalaryList
);

app.post("/employee/paySingleSalary/:id",
  authonticationController.validateToken,
  advancePaymentController.employeePaySingleSalary
);

app.post("/employee/payBulkSalary",
  authonticationController.validateToken,
  advancePaymentController.employeePayBulkSalary
);

module.exports = app;

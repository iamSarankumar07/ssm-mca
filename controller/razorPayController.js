const Student = require("../models/studentModel");
const moment = require("moment");
const crypto = require("crypto");
const paymentService = require("../services/paymentService");

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getTuitionCreatePaymentRazor = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('tuitionRazorPay', { studentData });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.getExamCreatePaymentRazor = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('examRazorPay', { studentData });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.createOrder = async (req, res) => {
    try {
        const { amount, paymentType, studentId, name, email, phone } = req.body;
        const txnId = "TXN" + Date.now();
        const txnDate = moment().format("DD-MM-YYYY");

        const options = {
            amount: parseInt(amount) * 100,
            currency: "INR",
            receipt: txnId,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);

        res.send({
            orderId: order.id,
            key: process.env.RAZORPAY_KEY_ID,
            txnId,
            txnDate,
        });
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).send({ error: "Failed to create Razorpay order" });
    }
};

exports.verifyAndSavePayment = async (req, res) => {
    try {
        const { paymentId, orderId, signature, paymentType, studentId, name, email, phone } = req.body;
        let reqBody = req.body;

        const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + "|" + paymentId)
            .digest("hex");

        if (generatedSignature !== signature) {
            return res.status(400).send({ error: "Payment verification failed" });
        }

        const paymentDetails = await razorpay.payments.fetch(paymentId);

        if (paymentDetails && paymentDetails.status === "captured") {
            paymentService.saveStripePayments(reqBody, paymentDetails);
            let formattedAmount = paymentDetails.amount / 100;
            res.status(200).json({
                success: true,
                redirectUrl: `/ssm/mca/paymentSuccessRazorPay?txnId=${reqBody.txnId}&amount=${formattedAmount}&name=${reqBody.name}&txnDate=${reqBody.txnDate}&email=${reqBody.email}&phone=${reqBody.phone}&description=${paymentDetails.description}`,
            });
        } else {
            res.status(400).send({ error: "Payment capture failed" });
        }
    } catch (err) {
        console.error("Error verifying Razorpay payment:", err);
        res.status(500).send({ error: "Failed to verify Razorpay payment" });
    }
};

exports.paymentSuccessRazorPay = async (req, res) => {
    try {
        const { txnId, amount, name, txnDate, email, phone, description } = req.query;

        res.render('paymentSuccessRazorPay', { txnId, txnDate, amount, name, email, phone, description });
    } catch (err) {
        console.error("Error handling payment success:", err);
    }
};

module.exports = exports;
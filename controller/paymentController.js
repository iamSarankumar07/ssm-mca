const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentService = require("../services/paymentService");
const moment = require("moment");
const paymentsModel = require("../models/paymentModel");
const messageModel = require("../models/messageModel");
const { verify } = require("jsonwebtoken");

exports.createPaymentStripe = async (req, res) => {
    try {
        let reqBody = req.body;
        const { stripeToken, amount, paymentType, email, phone, year } = reqBody;
        reqBody.txnId = "TXN"+Date.now();
        reqBody.txnDate = moment().format("DD-MM-YYYY");
        reqBody.year = year;
        const charge = await stripe.charges.create({
            amount: parseInt(amount) * 100,
            currency: 'INR',
            source: stripeToken,
            description: paymentType === "Tuition" ? "Tuition Fees Payment" : "Exam Fees Payment",
            receipt_email: 'sarankumars053@gmail.com',
            metadata: {
                email: email,
                phone: phone,
                order_id: reqBody.txnId,
            },
        });
        if (charge && charge.status === "succeeded") {
            charge.method = "Card";
            charge.paymentGateway = "StripePay"
            paymentService.savePaymentData(req.body, charge);
        }
        const formattedAmount = (charge.amount / 100).toFixed(2);
        res.render('paymentSuccess', { charge, formattedAmount, reqBody });
    } catch (err) {
       console.log("Error in createPayment : " + err);
       return res.redirect("/ssm/mca/studentProfile")
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await paymentsModel.find({}).sort({ createdAt: -1 });
        res.render('paymentsList', { payments });
    } catch (err) {
        console.error('Error fetching payments:', err);
        res.status(500).send('Error fetching payments');
    }
};


exports.getChatroom = async (req, res) => {
    const accessToken = req.cookies["access-token-student"];
    const decoded = verify(accessToken, "mnbvcxzlkjhgfdsapoiuytrewq");
    let username = decoded.name;

    try {
        const messages = await messageModel.find()
            .sort({ createdAt: -1 }) 
            .limit(100)
            .lean();

        res.render("chatroom", {
            username,
            isAdmin: false,
            initialMessages: JSON.stringify(messages),
        });
    } catch (err) {
        console.error("Error fetching initial messages:", err);
        res.render("chatroom", { username, initialMessages: "[]" });
    }
};

exports.getAdminChatroom = async (req, res) => {
    const accessToken = req.cookies["access-token"];
    const decoded = verify(accessToken, "qwertyuiopasdfghjklzxcvbnm");
    let username = decoded.name;

    try {
        const messages = await messageModel.find()
            .sort({ createdAt: -1 }) 
            .limit(100)
            .lean();

        res.render("chatroom", {
            username,
            isAdmin: true,
            initialMessages: JSON.stringify(messages),
        });
    } catch (err) {
        console.error("Error fetching initial messages:", err);
        res.render("chatroom", { username, initialMessages: "[]" });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.body;

        await messageModel.findByIdAndDelete(messageId);

        res.json({ success: true, message: "Message deleted successfully" });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ success: false, message: "Error deleting message" });
    }
};

module.exports = exports;
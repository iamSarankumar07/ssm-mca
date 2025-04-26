const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paymentService = require("../services/paymentService");
const moment = require("moment");
const paymentsModel = require("../models/paymentModel");
const messageModel = require("../models/messageModel");
const { verify } = require("jsonwebtoken");

const express = require('express');
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

exports.createPaymentStripe = async (req, res) => {
    try {
        let reqBody = req.body;
        const { stripeToken, amount, paymentType, email, phone, year } = reqBody;
        reqBody.txnId = "txn"+Date.now();
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
       return res.redirect("/v1/api/studentProfile")
    }
};

exports.getPayments = async (req, res) => {
    try {
        // const payments = await paymentsModel.find({}).sort({ createdAt: -1 });
        res.render('paymentsList');
    } catch (err) {
        console.log('Error fetching payments:', err);
        res.status(500).render('error', { message: "Internal Server Error. Please try again later" });
    }
};

exports.getTransactionsData = async (req, res) => {
    try {

        let search = req?.query?.search;
        let page = req?.query?.page;
        let pageSize = req?.query?.pageSize;
        let fromDate = req?.query?.fromDate;
        let toDate = req?.query?.toDate;

        const query = {};

        if (search) {
            query.$or = [
                { txnId: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ];
        }

        if (fromDate && toDate) {
            query.createdAt = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }

        const transactions = await paymentsModel.find(query)
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .sort({ createdAt: -1 });

        const total = await paymentsModel.countDocuments(query);

        await new Promise(resolve => setTimeout(resolve, 1500));

        res.json({
            success: true,
            transactions: transactions,
            totalRecords: total,
            page: Number(page),
            pageSize: Number(pageSize)
        });
    } catch (err) {
        console.log('Error fetching payments:', err);
        res.status(500).json({
            success: false,
            totalRecords: 0,
            transactions: [],
            message: 'Internal Server Error!'
        });
    }
};

exports.getTransactionsDataById = async (req, res) => {
    try {

        let txnId = req?.params?.txnId;

        const transactions = await paymentsModel.findOne({ txnId: txnId });

        res.json(transactions);
    } catch (err) {
        console.log('Error fetching payments:', err);
        res.status(500).json();
    }
};

exports.getChatroom = async (req, res) => {
    const accessToken = req.cookies["access-token-student"];
    const decoded = verify(accessToken, "mnbvcxzlkjhgfdsapoiuytrewq");
    let username = decoded.name;
    let year = decoded.year;
    let course = decoded.course
    let senderId = decoded.id

    try {
        const messages = await messageModel.find({ year: year, course: course})
            .sort({ createdAt: -1 }) 
            .limit(100)
            .lean();

        res.render("chatroom", {
            username,
            senderId,
            year,
            course: course,
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
    let reqBody = req.body;
    let year = reqBody.year;
    let course = reqBody.course;
    let senderId = decoded.id;


    try {
        const messages = await messageModel.find({ year: year, course: course })
            .sort({ createdAt: -1 }) 
            .limit(100)
            .lean();

        res.render("chatroom", {
            username,
            senderId,
            year,
            course: course,
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
        const accessToken = req.cookies["access-token"];
        if (!accessToken) return res.status(403).json({ success: false, message: "Unauthorized" });

        const decoded = verify(accessToken, "qwertyuiopasdfghjklzxcvbnm"); 
        if (!decoded || decoded.role !== "admin") return res.status(403).json({ success: false, message: "Not authorized" });

        await messageModel.findByIdAndDelete(req.params.id);
        io.emit("messageDeleted", req.params.id); 
        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting message:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = exports;
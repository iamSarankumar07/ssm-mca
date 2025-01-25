const paymentModel = require("../models/paymentModel");
const nodemailer = require("nodemailer");

exports.saveStripePayments = async (reqBody, paymentData) => {
    try {
        let txnData = {
            txnId: reqBody.txnId,
            amount: paymentData.amount / 100,
            currency: paymentData.currency.toUpperCase(),
            paymentStatus: "Succcess",
            paymentType: reqBody.paymentType,
            paymentMode: paymentData.method,
            description: paymentData.description,
            receipt_url: paymentData.receipt_url || "",
            studentId: reqBody.studentId,
            name: reqBody.name,
            email: reqBody.email,
            txnDate: reqBody.txnDate,
            year: reqBody.year,
        };

        let savedPayment = await new paymentModel(txnData).save();
        console.log("Payment data saved to DB");

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "verifyuserofficial@gmail.com",
                pass: "wsdv megz vecp wzen",
            },
        });

        const mailOptions = {
            from: 'verifyuserofficial@gmail.com',
            to: reqBody.email,
            subject: '🎉 Payment Confirmation - Thank You for Your Payment!',
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Payment Confirmation</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #333;
                        margin: 0;
                        padding: 0;
                        background-color: #f9f9f9;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    h1 {
                        font-size: 28px;
                        color: #4CAF50;
                        margin-bottom: 10px;
                        text-transform: capitalize;
                    }
                    h1 span {
                        font-size: 32px;
                    }
                    p {
                        margin-bottom: 15px;
                    }
                    ul {
                        list-style: none;
                        padding: 0;
                    }
                    ul li {
                        margin: 10px 0;
                        font-size: 16px;
                        color: #555;
                    }
                    .btn {
                        display: inline-block;
                        margin: 20px auto;
                        padding: 12px 20px;
                        font-size: 16px;
                        font-weight: bold;
                        color: #ffffff;
                        background-color: #4CAF50;
                        border-radius: 5px;
                        text-decoration: none;
                        text-transform: uppercase;
                        transition: background-color 0.3s;
                    }
                    .btn:hover {
                        background-color: #45a049;
                    }
                    .footer {
                        font-size: 14px;
                        color: #999;
                        margin-top: 20px;
                        text-align: center;
                    }
                    .emoji {
                        font-size: 24px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1><span class="emoji">🎉</span> Payment Received <span class="emoji">✔️</span></h1>
                    <p>Dear <strong>${reqBody.name}</strong>,</p>
                    <p>We are delighted to inform you that your payment has been successfully processed! <span class="emoji">💳</span></p>
                    <p><strong>Payment Details:</strong></p>
                    <ul>
                        <li>💳 <strong>Transaction ID:</strong> ${reqBody.txnId}</li>
                        <li>💰 <strong>Amount:</strong> ${paymentData.amount / 100} ${paymentData.currency.toUpperCase()}</li>
                        <li>📝 <strong>Description:</strong> ${paymentData.description}</li>
                        <li>📅 <strong>Payment Date:</strong> ${reqBody.txnDate}</li>
                    </ul>
                    <p>You can download your payment receipt using the link below:</p>
                    <a class="btn" href="${paymentData.receipt_url}" style="color: white;" target="_blank">View Receipt</a>
                    <p>If you have any questions, feel free to reach out to us at <a href="mailto:saran@outlook.in" style="color: #4CAF50;">saran@outlook.in</a>.</p>
                    <div class="footer">
                        <p>This is an automated message. Please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} SSM COLLEGE OF ENGINEERING. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log(err, 'Email Sent Failed...');
            } else {
                console.log('Email Sent Successfully....');
            }
        });
    } catch (err) {
        console.log("Error in saveStripePayments : " + err);
    }
};
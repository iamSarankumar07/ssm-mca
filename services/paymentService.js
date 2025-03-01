const paymentModel = require("../models/paymentModel");
const nodemailer = require("nodemailer");
const studentModel = require("../models/studentModel");

exports.savePaymentData = async (reqBody, paymentData) => {
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
            paymentGateway: paymentData.paymentGateway
        };

        let duplicatePayment = await paymentModel.findOne({ txnId: reqBody.txnId });

        if (duplicatePayment) {
            return
        } else {
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
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Confirmation</title>
                    <!--[if mso]>
                    <noscript>
                        <xml>
                            <o:OfficeDocumentSettings>
                                <o:PixelsPerInch>96</o:PixelsPerInch>
                            </o:OfficeDocumentSettings>
                        </xml>
                    </noscript>
                    <![endif]-->
                    <style>
                        @media screen and (max-width: 600px) {
                            .container {
                                width: 100% !important;
                                padding: 20px !important;
                            }
                            .details {
                                padding: 10px !important;
                            }
                            .btn {
                                display: block !important;
                                width: 100% !important;
                            }
                        }
                    </style>
                </head>
                <body style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f4f4f4;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td style="padding: 30px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td style="text-align: center; padding-bottom: 20px;">
                                            <h1 style="font-size: 24px; color: #28a745; margin: 0;">Payment Successful ✅</h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 20px;">
                                            <p style="margin: 0 0 15px 0; color: #34495e;">Dear ${reqBody.name},</p>
                                            <p style="margin: 0 0 15px 0; color: #34495e;">We are pleased to confirm that your payment has been successfully processed.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                <tr>
                                                    <th style="font-weight: bold; color: #2c3e50; text-align: left; padding: 10px; border-bottom: 1px solid #e0e0e0;">Transaction ID:</th>
                                                    <td style="text-align: left; padding: 10px; border-bottom: 1px solid #e0e0e0;">${reqBody.txnId}</td>
                                                </tr>
                                                <tr>
                                                    <th style="font-weight: bold; color: #2c3e50; text-align: left; padding: 10px; border-bottom: 1px solid #e0e0e0;">Amount:</th>
                                                    <td style="text-align: left; padding: 10px; border-bottom: 1px solid #e0e0e0;">${paymentData.amount / 100} ${paymentData.currency.toUpperCase()}</td>
                                                </tr>
                                                <tr>
                                                    <th style="font-weight: bold; color: #2c3e50; text-align: left; padding: 10px; border-bottom: 1px solid #e0e0e0;">Description:</th>
                                                    <td style="text-align: left; padding: 10px; border-bottom: 1px solid #e0e0e0;">${paymentData.description}</td>
                                                </tr>
                                                <tr>
                                                    <th style="font-weight: bold; color: #2c3e50; text-align: left; padding: 10px;">Payment Date:</th>
                                                    <td style="text-align: left; padding: 10px;">${reqBody.txnDate}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-top: 20px; padding-bottom: 20px;">
                                            <p style="margin: 0 0 15px 0; color: #34495e;">To access your payment receipt, please click the button below:</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 20px;">
                                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                                                <tr>
                                                    <td style="border-radius: 3px; background: #3d6ef5; text-align: center;">
                                                        <a href="${paymentData.receipt_url}" style="background: #3d6ef5; border: 15px solid #3d6ef5; padding: 0 10px; color: #ffffff; font-family: sans-serif; font-size: 16px; line-height: 1.1; text-align: center; text-decoration: none; display: block; border-radius: 3px; font-weight: bold;" target="_blank">
                                                            View Receipt
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 20px;">
                                            <p style="margin: 0; color: #34495e;">If you have any questions or concerns regarding this transaction, please don't hesitate to contact our support team at <a href="mailto:iamsarankumar@outlook.in" style="color: #3498db;">iamsarankumar@outlook.in</a>.</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 14px; color: #7f8c8d; text-align: center;">
                                            <p style="margin: 0 0 10px 0;">This is an automated message. Please do not reply to this email.</p>
                                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} SSM COLLEGE OF ENGINEERING. All rights reserved.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
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
        }
    } catch (err) {
        console.log("Error in savePaymentData : " + err);
    }
};

exports.updateStudentPayment = async (reqBody, paymentData) => {

  try {
    let student = await studentModel.findOne({ studentId: reqBody.studentId });

    let paidAmount = paymentData.amount / 100;
    
    if (reqBody.paymentType === "Tuition") {

        let currentPaid = Number(student.paidFeeTu) + Number(paidAmount);
        let totalFee = Number(student.totalFee);
        let newTuPendingFee = Number(student.pendingFee) - Number(paidAmount);
        let paymentStatus = totalFee === currentPaid ? "Paid" : "Partial";
    
        student.pendingFee = newTuPendingFee.toString();
        student.paidFeeTu = currentPaid.toString();
        student.paymentStatus = paymentStatus;
        student.tuEditRequest = null;
        await student.save();

    } else if (reqBody.paymentType === "Exam") {

        let currentPaid = Number(student.paidFeeEx) + Number(paidAmount);
        let totalFee = Number(student.examTotalFee);
        let newTuPendingFee = Number(student.examPendingFee) - Number(paidAmount);
        let paymentStatus = totalFee === currentPaid ? "Paid" : "Partial";
    
        student.examPendingFee = newTuPendingFee.toString();
        student.paidFeeEx = currentPaid.toString();
        student.examPaymentStatus = paymentStatus;
        student.exEditRequest = null;
        await student.save();

    } else {
        return;
    }
  } catch (err) {
    console.log("Error in savePaymentData : " + err);
  }
};
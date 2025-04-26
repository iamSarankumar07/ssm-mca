const paymentModel = require("../models/paymentModel");
const nodemailer = require("nodemailer");
const studentModel = require("../models/studentModel");

exports.savePaymentData = async (reqBody, paymentData) => {
    try {
        let studentData = await studentModel.findOne({ studentId: reqBody.studentId }).lean();
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
            txnDate: new Date(),
            year: reqBody.year,
            course: studentData.course,
            paymentGateway: paymentData.paymentGateway,
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
      if (!student) {
        console.log("Student not found");
        return;
      }
  
      let paidAmount = paymentData.amount / 100;
  
      if (reqBody.paymentType === "Tuition") {
        let currentPaid = Number(student.tuitionFees.paidFee) + Number(paidAmount);
        let totalFee = Number(student.tuitionFees.totalFee);
        let newPendingFee = totalFee - currentPaid;
        let paymentStatus = currentPaid >= totalFee ? "Paid" : "Partial";
  
        student.tuitionFees.pendingFee = newPendingFee > 0 ? newPendingFee : 0;
        student.tuitionFees.paidFee = currentPaid;
        student.tuitionFees.status = paymentStatus;
        student.tuEditRequest = null;
      
      } else if (reqBody.paymentType === "Exam") {
        let currentPaid = Number(student.examFees.paidFee) + Number(paidAmount);
        let totalFee = Number(student.examFees.totalFee);
        let newPendingFee = totalFee - currentPaid;
        let paymentStatus = currentPaid >= totalFee ? "Paid" : "Partial";
  
        student.examFees.pendingFee = newPendingFee > 0 ? newPendingFee : 0;
        student.examFees.paidFee = currentPaid;
        student.examFees.status = paymentStatus;
        student.exEditRequest = null;
      
      } else {
        console.log("Invalid payment type");
        return;
      }
  
      await student.save();
      console.log("Payment updated successfully");
    } catch (err) {
      console.error("Error in updateStudentPayment: ", err);
    }
  };
  

exports.sendSalaryAlert = async (employee, txnData) => {
    try {

        let accountLast4 = employee.bankDetails.accountNumber.slice(-4);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "verifyuserofficial@gmail.com",
                pass: "wsdv megz vecp wzen",
            },
        });

        const mailOptions = {
            from: 'verifyuserofficial@gmail.com',
            to: employee.email,
            subject: '🎉 Payment Confirmation - Thank You for Your Payment!',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Salary Processed Successfully</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                font-family: 'Inter', Arial, sans-serif;
                background-color: #f5f7fa;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.6;
                }
                .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                }
                .email-header {
                background-color: #10b981;
                padding: 30px;
                text-align: center;
                }
                .email-header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                }
                .email-body {
                padding: 30px;
                }
                .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                }
                .details-card {
                background-color: #f9fafb;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #10b981;
                }
                .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 12px;
                padding-bottom: 12px;
                border-bottom: 1px solid #eaeaea;
                }
                .detail-label {
                font-weight: 500;
                color: #6b7280;
                width: 40%;
                }
                .detail-value {
                font-weight: 600;
                color: #111827;
                text-align: right;
                width: 60%;
                }
                .message {
                margin: 25px 0;
                line-height: 1.7;
                }
                .contact-button {
                display: inline-block;
                background-color: #4f46e5;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 500;
                margin-top: 10px;
                text-align: center;
                }
                .email-footer {
                background-color: #f9fafb;
                padding: 20px 30px;
                font-size: 14px;
                color: #6b7280;
                border-top: 1px solid #eaeaea;
                }
                .company-info {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #eaeaea;
                }
                @media only screen and (max-width: 600px) {
                .email-header, .email-body, .email-footer {
                    padding: 20px;
                }
                .details-card {
                    padding: 15px;
                }
                .detail-row {
                    flex-direction: column;
                    padding-bottom: 15px;
                }
                .detail-label {
                    width: 100%;
                    margin-bottom: 5px;
                }
                .detail-value {
                    width: 100%;
                    text-align: right;
                }
                }
            </style>
            </head>
            <body>
            <div class="email-container">
                <div class="email-header">
                <h1>Salary Processed Successfully</h1>
                </div>
                
                <div class="email-body">
                <p class="greeting">Dear <strong>${employee.fullName}</strong>,</p>
                
                <p class="message">We are pleased to inform you that your salary for this month has been successfully processed. The amount will be credited to your bank account shortly, depending on the bank's processing time.</p>
                
                <div class="details-card">
                    <div class="detail-row">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value">₹${txnData.amount}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Payment Date</span>
                    <span class="detail-value">${txnData.date}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Transaction ID</span>
                    <span class="detail-value">${txnData.transactionId}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Bank Name</span>
                    <span class="detail-value">${employee.bankDetails.bankName}</span>
                    </div>
                    <div class="detail-row">
                    <span class="detail-label">Account Number</span>
                    <span class="detail-value">**** **** **** ${accountLast4}</span>
                    </div>
                </div>
                
                <p class="message">If you have any questions or need further assistance, please feel free to contact our HR or Finance team.</p>
                
                <p class="message">Thank you for your hard work and dedication!</p>
                </div>
                
                <div class="email-footer">
                <p>Best regards,<br/>
                <strong>SSM College Of Engineering</strong><br/>
                HR & Finance Department</p>
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
        console.log("Error in sendSalaryAlert : " + err);
    }
}
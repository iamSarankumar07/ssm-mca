const express = require("express");
const nodemailer = require("nodemailer");
const Student = require("../models/studentModel");
const app = express();

exports.sendMail = async (req, res) => {
  try {
    const students = await Student.find({}, "email");
    const studentEmails = students.map((user) => user.email);
    console.log("All user emails:", studentEmails);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      subject: "Happy New Year 🎉.",
    };

    for (let i = 0; i < studentEmails.length; i++) {
      mailOptions.to = studentEmails[i];
      mailOptions.html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
          <title>Welcome to Our Community!</title>
          <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #ff9900;
            text-align: center;
          }
          p {
            margin-bottom: 15px;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777777;
            text-align: center;
          }
          </style>
          </head>
          <body>
          <div class="container">
          <h1>HAPPY NEW YEAR 2024 🎉</h1>
          <p>Dear Students,</p>
          <p>As we step into the new year, we want to extend our warmest wishes to you. May the year 2024 bring you joy, success, and prosperity in all your endeavors.<br><br> Have a Great Day 😊...</p>
          <p>If you have any questions or need further assistance, please feel free to <a href="mailto:verifyuserofficial@gmail.com" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
          <p>Best regards,<br>Saran Kumar.</p>
          <div class="footer">
          This is an automated message. Please do not reply to this email.
          </div>
          </div>
          </body>
          </html>
          `;
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(`Error sending email to ${studentEmails[i]}:`, err);
        } else {
          console.log(`Email sent successfully to ${studentEmails[i]}.`);
        }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error("Error:", err.message);
  }
};

module.exports = exports;

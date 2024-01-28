const express = require('express');
const Contact = require('../models/contactModel');
const nodemailer = require('nodemailer');
const app = express();

exports.contact = async (req, res) => {
    try {
      const contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
      });
  
      const savedContact = await contact.save();
      console.log(savedContact);

      const transPorter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user: 'verifyuserofficial@gmail.com',
            pass: 'wsdv megz vecp wzen'
        },
      });
  
      await transPorter.sendMail({
        from: 'verifyuserofficial@gmail.com',
        to: contact.email,
        subject: 'Thank you for contacting us', 
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting us</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              background-color: #f8f9fa;
              color: #333;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
              color: #007bff;
            }
            p {
              margin-bottom: 10px;
            }
            .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #888;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Thank you for contacting us!</h1>
            <p>Dear ${contact.name},</p>
            <p>We have received your message and will get back to you soon.</p>
            <p>If you have any further questions or need assistance, feel free to contact us.</p>
            <p>Best regards,<br>Sarankumar</p>
            <div class="footer">
              This is an automated message. Please do not reply to this email.
            </div>
          </div>
        </body>
        </html>
      `
      });
      const adminTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'verifyuserofficial@gmail.com',
          pass: 'wsdv megz vecp wzen'
        },
      });
  
      await adminTransporter.sendMail({
        from: 'verifyuserofficial@gmail.com',
        to: 'sarankumars053@gmail.com',
        subject: 'New Contact Form Submission',
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <h1 style="font-size: 28px; margin-bottom: 20px; color: #007bff;">Contact Received</h1>
            <div style="margin-bottom: 20px;">
              <p style="margin-bottom: 10px;"><strong style="color: #333;">Name:</strong> ${contact.name}</p>
              <p style="margin-bottom: 10px;"><strong style="color: #333;">Email:</strong> ${contact.email}</p>
              <p style="margin-bottom: 10px;"><strong style="color: #333;">Message:</strong></p>
              <p style="margin-bottom: 10px; padding-left: 20px; border-left: 2px solid #007bff; color: #555; font-style: italic;">${contact.message}</p>
            </div>
            <div style="text-align: center; color: #888; font-size: 14px;">
              <p style="margin-bottom: 10px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `
      });
      res.redirect("/")
    } catch (err) {
      console.log(err);
      res.send('Internal Server Error');
    }
};


module.exports = exports;

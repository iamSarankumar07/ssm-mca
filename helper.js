const nodemailer = require("nodemailer");
const { google } = require('googleapis');
const axios = require("axios");
const notificationModel = require("./models/notificationsModel");
const emailTemplateModel = require("./models/templateModel");

const CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.EMAIL_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.EMAIL_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);


oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

exports.sendEmail = async (email, subject, template) => {
    try {
        // let accessToken = await this.getAccessToken();

        if (true) {

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "ssmcollegeofengineering.ce@gmail.com",
                    pass: "xotj gtda ojfg zbtc",
                },
            });

            const mailOptions = {
                from: "ssmcollegeofengineering.ce@gmail.com",
                to: email,
                subject: subject,
                html: template
            }

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log("Error sending OTP email:", err);
                } else {
                    console.log("Email sent successfully:", info.response);
                }
            });
        }
    } catch (err) {
        console.log("Error in sendEmail: ", err);
        return { status: false, message: "Error in sendEmail" };
    }
};

exports.sendNotification = async (title, message, userId, type) => {
    try {
        let notofication = new notificationModel({
            title: title,
            message: {
                title: title,
                description: message,
            },
            userId: userId,
            type: type ? type : null
        });
        let savedData = await notofication.save();
        // console.log("Notification saved successfully");
    } catch (err) {
        console.log("Error in sendNotification: ", err);
        return { status: false, message: "Error in sendNotification" };
    }
};

exports.getAccessToken = async () => {
    try {
        // const accessToken = await oAuth2Client.getAccessToken();
        const accessToken = await axios.post('https://oauth2.googleapis.com/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: 'refresh_token',
        });
        return { status: true, token: accessToken?.data?.access_token || accessToken?.token || null };
    } catch (err) {
        console.log("Error in getAccessToken: ", err);
        return { status: false, message: "Error in getAccessToken" };
    }
};

exports.getEmailTemplate = async (templateName) => {
    try {
        let template = await emailTemplateModel.findOne({ name: templateName }).lean();
        if (template) {
            return { status: true, template: template?.content };
        } else {
            return { status: false, message: "Template not found" };
        }
    } catch (err) {
        console.log("Error in getEmailTemplate: ", err);
        return { status: false, message: "Error in getEmailTemplate" };
    }
};

module.exports = exports;
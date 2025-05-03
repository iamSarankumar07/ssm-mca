const nodemailer = require("nodemailer");
const notificationModel = require("./models/notificationsModel");

exports.sendEmail = (email, title, subject, message, userId) => {
    try {
        
    } catch (err) {
        console.log("Error in sendEmail: ", err);
        return { status: false, message: "Error in sendEmail" };
    }
};

exports.sendNotification = async (title, message, userId) => {
    try {
        let notofication = new notificationModel({
            title: title,
            message: {
                title: title,
                description: message,
            },
            userId: userId,
        });
        let savedData = await notofication.save();
        // console.log("Notification saved successfully");
    } catch (err) {
        console.log("Error in sendNotification: ", err);
        return { status: false, message: "Error in sendNotification" };
    }
};

module.exports = exports;
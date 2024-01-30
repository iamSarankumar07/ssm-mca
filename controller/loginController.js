const express = require("express");
const Login = require("../models/loginModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const authFile = require("../middleware/auth");
const path = require("path");
const app = express();

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

exports.signup = async (req, res) => {
  const user = new Login({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender,
  });

  const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
  const userName = `${user.name.toLowerCase()}${uniqueNumber}`;

  user.userName = userName;

  const password = Math.random().toString(36).substring(2, 8);
  console.log(
    `Name : ${user.name} \nUsername: ${userName} \nPassword : ${password}`
  );

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  user.password = hashedPassword;

  try {
    const a1 = await user.save();

    const transPorter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      to: user.email,
      subject: "Registration Successful.",
      html: `
    <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Welcome to Our Community!</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }
      h1 {
        font-size: 36px;
        color: #007bff; 
        margin-bottom: 20px;
        text-align: center;
        text-transform: uppercase;
      }
      p {
        margin-bottom: 15px;
        text-align: justify;
      }
      ul {
        margin-bottom: 15px;
        padding-left: 20px;
      }
      li {
        margin-bottom: 5px;
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      .footer {
        font-size: 14px;
        color: #999;
        margin-top: 20px;
        text-align: center;
      }
      .highlight {
        background-color: #eaf6ff;
        padding: 5px 10px;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to Our Community! 🎉</h1>
      <p>Dear ${user.name},</p>
      <p>We are thrilled to welcome you to our community! Your account has been successfully created 🚀.</p>
      <p>Here are your login details:</p>
      <ul>
        <li><strong>Username : </strong> ${userName}</li>
        <li><strong>Password : </strong> ${password}</li>
      </ul>
      <p>If you have any questions or need further assistance, please feel free to <a href="mailto:verifyuserofficial@gmail.com" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
      <p>Best regards,<br>Saran Kumar.</p>
      <div class="footer">
        This is an automated message. Please do not reply to this email.
      </div>
    </div>
  </body>
  </html>
  `,
    };

    transPorter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err, "Email Sent Failed...");
      } else {
        console.log("Email Sent Successfully....");
      }
    });

    res.render("signupSucces");
  } catch (error) {
    res.send(err.message, "Error");
  }
};

exports.login = async (req, res) => {
  try {
    const user = await Login.findOne({ userName: req.body.userName });
    if (!user) {
      return res.send(
        '<script>alert("Incorrect Username"); window.location.href = "/ssm/mca/login";</script>'
      );
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatch) {
      return res.send(
        '<script>alert("Wrong Password"); window.location.href = "/ssm/mca/login";</script>'
      );
    }

    const OTP = Math.floor(100000 + Math.random() * 900000);
    console.log(OTP);

    user.otp = OTP;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      to: user.email,
      subject: "Email Verification",
      html: `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 16px;
              color: #333;
              margin: 0;
              padding: 0;
            }
        
            .container {
              width: 80%;
              max-width: 600px;
              margin: 20px auto;
              background-color: #f5f5f5;
              border-radius: 5px;
              padding: 30px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
        
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
        
            .header h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #007bff; 
            }
        
            .content {
              line-height: 1.5;
            }
        
            .otp-code {
              font-weight: bold;
              font-size: 18px;
              text-align: center;
              margin-bottom: 20px;
              border: 1px solid #ccc;
              padding: 10px 20px;
              border-radius: 5px;
            }
        
            .footer {
              text-align: center;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification</h1>
            </div>
            <div class="content">
              <p>Hello ${user.name},</p>
              <p>Please use the following OTP to verify your login:</p>
              <p class="otp-code">${OTP}</p>
              <p>This OTP is valid for 10 Minutes.</p>
              <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Thank you.</p>
            </div>
          </div>
        </body>
        </html>
        `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error sending OTP email:", err);
        return res.send(
          '<script>alert("Error sending OTP"); window.location.href = "/ssm/mca/login";</script>'
        );
      }
      console.log("OTP sent successfully");
      res.render("otp", { user: user });
    });
  } catch (err) {
    console.log("Error in userLogin:", err);
    res.send("Internal Server Error");
  }
};

exports.otp = async (req, res) => {
  try {
    const user = await Login.findOne({ otp: req.body.otp });

    if (!user) {
      console.log("User not found");
      return res.send(
        '<script>alert("Incorrect OTP or OTP Expired!"); window.location.href = "/ssm/mca/login";</script>'
      );
    }

    console.log("OTP Verified.");

    user.isOTPVerified = true;
    user.otp = null;
    await user.save();

    const accessToken = await authFile.token(user);
    res.cookie("access-token", accessToken, {
      maxAge: 60 * 60 * 1000,
    });

    res.redirect("/home");
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.send("Internal Server Error");
  }
};

module.exports = exports;

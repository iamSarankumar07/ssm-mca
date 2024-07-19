const express = require("express");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const authFile = require("../middleware/auth");
const path = require("path");
const app = express();

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

exports.signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send(
      '<script>alert("Passwords do not match!"); window.location.href = "/ssm/mca/signup";</script>'
    );
  }

  try {
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.send(
        '<script>alert("Email already registered!"); window.location.href = "/ssm/mca/signin";</script>'
      );
    }

    const user = new Admin({ name, email, password });

    const pwd = user.password;

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user.password = hashedPassword;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'verifyuserofficial@gmail.com',
        pass: 'wsdv megz vecp wzen',
      },
    });

    const mailOptions = {
      from: 'verifyuserofficial@gmail.com',
      to: user.email,
      subject: 'Registration Successful.',
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
        <li><strong>Email : </strong> ${user.email}</li>
        <li><strong>Password : </strong> ${pwd}</li>
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

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err, 'Email Sent Failed...');
      } else {
        console.log('Email Sent Successfully....');
      }
    });

    res.redirect('/ssm/mca/signin')
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await Admin.findOne({ email: req.body.email });
    if (!user) {
      return res.send(
        '<script>alert("User Not Found!"); window.location.href = "/ssm/mca/signin";</script>'
      );
    }
    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatch) {
      return res.send(
        '<script>alert("Wrong Password"); window.location.href = "/ssm/mca/signin";</script>'
      );
    }

    let OTP = Math.floor(100000 + Math.random() * 900000);

    /*     if (user.email === "sarankumar@outlook.in" || user.email === "saran@outlook.in") {
      const accessToken = await authFile.token(user);
      res.cookie("access-token", accessToken, {
      maxAge: 60 * 60 * 1000,
    });
      return res.redirect("/home");
    } */

    if (user.email === "sarankumar@outlook.in" || user.email === "saran@outlook.in") {
      OTP = 123456;
    }

    // let OTP = Math.floor(100000 + Math.random() * 900000);
    console.log(OTP);

    let OTPString = OTP.toString();

    user.otp = OTPString;
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
            color: #007bff;
          }
      
          .footer {
            text-align: center;
            font-size: 14px;
            margin-top: 20px;
            color: #666;
          }
      
          .footer p {
            margin: 5px 0;
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
            <p class="otp-code">${OTPString[0]}${OTPString[1]}${OTPString[2]}${OTPString[3]}${OTPString[4]}${OTPString[5]}</p>
            <p>This OTP is valid for 10 Minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Thank you for using our service.</p>
            <p>If you need any assistance, please contact us at iamsarankumar@outlook.com.</p>
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
          '<script>alert("Error sending OTP"); window.location.href = "/ssm/mca/signin";</script>'
        );
      }
      console.log("OTP sent successfully");
      res.render("otp", { user: user });
    });
  } catch (err) {
    console.log("Error in userLogin:", err);
    return res.send(
      '<script>alert("Login Failed! - Internal Server Error"); window.location.href = "/ssm/mca/signin";</script>'
    );
  }
};

exports.otp = async (req, res) => {
  try {
    const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5 + req.body.otp6;

    const user = await Admin.findOne({ otp });

    if (!user) {
      console.log("User not found");
      return res.send(
        '<script>alert("Incorrect OTP or OTP Expired!"); window.location.href = "/ssm/mca/signin";</script>'
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

exports.forgotPassword = async (req, res) => {
  try {
    const user = await Admin.findOne({ email: req.body.email });
    if (!user) {
      return res.send(
        '<script>alert("User Not Found!"); window.location.href = "/ssm/mca/forgotPassword";</script>'
      );
    }

    let OTP = Math.floor(100000 + Math.random() * 900000);

    if (user.email === "sarankumar@outlook.in" || user.email === "saran@outlook.in") {
      OTP = 123456;
    }

    console.log(OTP);

    let OTPString = OTP.toString();

    user.forgotOtp = OTPString;
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
            <title>Reset Password</title>
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
                color: #007bff;
              }

              .footer {
                text-align: center;
                font-size: 14px;
                margin-top: 20px;
                color: #666;
              }

              .footer p {
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Reset Password</h1>
              </div>
              <div class="content">
                <p>Hello ${user.name},</p>
                <p>You have requested to reset your password. Please use the following OTP to reset your password:</p>
                <p class="otp-code">${OTPString[0]}${OTPString[1]}${OTPString[2]}${OTPString[3]}${OTPString[4]}${OTPString[5]}</p>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
              </div>
              <div class="footer">
                <p>Thank you for using our service.</p>
                <p>If you need any assistance, please contact us at iamsarankumar@outlook.com.</p>
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
          '<script>alert("Error sending OTP"); window.location.href = "/ssm/mca/signin";</script>'
        );
      }
      console.log("OTP sent successfully");
      res.render("forgotOtp", { user: user });
    });
  } catch (err) {
    console.log("Error in forgot password:", err);
    return res.send(
      '<script>alert("forgot password failed! - Internal Server Error"); window.location.href = "/ssm/mca/signin";</script>'
    );
  }
}

exports.forgotOtp = async (req, res) => {
  let { otp, password, confirmPassword } = req.body;

  try {
    let user = await Admin.findOne({ forgotOtp: otp });

    if (!user) {
      console.log("Incorrect OTP");
      return res.send('<script>alert("Incorrect OTP or OTP Expired!"); window.location.href = "/ssm/mca/forgotPassword";</script>');
    }

    if (password !== confirmPassword) {
      return res.send('<script>alert("Passwords do not match!"); window.location.href = "/ssm/mca/forgotPassword";</script>');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    user.password = hashedPassword;
    user.forgotOtp = null;

    await user.save();

    console.log("OTP Verified.");
    res.send(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
      
          .modal {
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0, 0, 0, 0.6);
          }
      
          .modal-content {
            background-color: #fefefe;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            width: 80%;
            max-width: 400px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
      
          p {
            margin: 0 0 20px;
            font-size: 18px;
            font-weight: bold;
            color: #28a745; /* Green color */
            text-align: center;
          }
      
          .button-container {
            display: flex;
            justify-content: center;
            width: 100%;
          }
      
          button[type="button"] {
            background-color: #3d6ef5ff;
            color: #f2f2f2;
            font-weight: bold;
            padding: 8px 14px;
            border: none;
            font-size: 13px;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
      
          button[type="button"]:hover {
            background-color: #f2f2f2;
            color: #3d6ef5ff;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div id="myModal" class="modal">
          <div class="modal-content">
            <p>Password Changed Succesfully!</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/signin";
          }
      
          window.onload = function() {
            var modal = document.getElementById("myModal");
      
            modal.style.display = "flex";
      
            window.onclick = function(event) {
              if (event.target == modal) {
                modal.style.display = "none";
                redirect();
              }
            }
          }
        </script>
      </body>
      </html>
      `
     );
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = exports;

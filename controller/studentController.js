const express = require("express");
const Student = require("../models/studentModel");
const authFile = require("../middleware/auth");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const app = express();

exports.newStudent = async (req, res) => {
  const body = req.body;
  const student = new Student({
    name: body.name,
    registerNumber: body.registerNumber,
    gender: body.gender,
    dob: body.dob,
    year: body.year,
    phone: body.phone,
    email: body.email,
    totalFee: body.totalFee,
    pendingFee: body.pendingFee,
    paymentStatus: body.paymentStatus,
    examTotalFee: body.examTotalFee,
    examPendingFee: body.examPendingFee,
    examPaymentStatus: body.examPaymentStatus,
    tutionDueDate: body.tutionDueDate,
    examDueDate: body.examDueDate,
  });

  student.pendingFee = student.totalFee;
  student.paymentStatus = "Pending";
  student.tutionDueDate = "";

  student.examTotalFee = 0;
  student.examPendingFee = 0;
  student.examPaymentStatus = "Pending";
  student.examDueDate = "";

  const studentId = student.registerNumber;
  student.studentId = studentId;

  const password = student.dob.toString();
  console.log(
    `Name : ${student.name} \nUsername: ${studentId} \nPassword : ${password}`
  );
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  student.password = hashedPassword;

  try {
    const a1 = await student.save();
    console.log("Student Added to DataBase...");

    const transPorter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      to: student.email,
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
      <h1>Welcome to SSM College Of Engineering! 🎉</h1>
      <p>Dear ${student.name},</p>
      <p>We are thrilled to welcome you to our College! Your account has been successfully Registered 🚀.</p>
      <p>Here are your login details:</p>
      <ul>
        <li><strong>Student ID : </strong> ${studentId}</li>
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

    res.redirect("/ssm/mca/register");
  } catch (err) {
    res.send(err.message, "Error");
  }
};

exports.login = async (req, res) => {
  const { studentId, password } = req.body;

  try {
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.send(
        '<script>alert("Student not Found!"); window.location.href = "/ssm/mca/studentLogin";</script>'
      );
    }
    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      return res.send(
        '<script>alert("Wrong Password!"); window.location.href = "/ssm/mca/studentLogin";</script>'
      );
    }
    const accessToken = await authFile.sToken(student);
    res.cookie("access-token", accessToken, {
      maxAge: 60 * 60 * 1000,
    });

    res.redirect("/studentHome");
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).send("Failed to login");
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Student.findByIdAndUpdate(userId, { isDelete: true });
    res.redirect("/ssm/mca/studentList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const body = req.body;
    const userId = req.params.userId;

    await Student.findByIdAndUpdate(userId, {
      name: body.name,
      registerNumber: body.registerNumber,
      gender: body.gender,
      dob: body.dob,
      year: body.year,
      phone: body.phone,
      email: body.email,
      totalFee: body.totalFee,
      pendingFee: body.pendingFee,
      paymentStatus: body.paymentStatus,
      examTotalFee: body.examTotalFee,
      examPendingFee: body.examPendingFee,
      examPaymentStatus: body.examPaymentStatus,
    });

    res.redirect("/ssm/mca/studentList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

module.exports = exports;

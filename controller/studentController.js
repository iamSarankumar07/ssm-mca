const express = require("express");
const Student = require("../models/studentModel");
const authFile = require("../middleware/auth");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const app = express();

exports.newStudent = async (req, res) => {
  const body = req.body;

  const existingStudent = await Student.findOne({
    registerNumber: body.registerNumber,
  });
  if (existingStudent) {
    return res.send(
      '<script>alert("Registration number already exists!"); window.location="/ssm/mca/register";</script>'
    );
  }

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

    // res.redirect("/ssm/mca/register");
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
           <p>Registration Successful!</p>
           <div class="button-container">
             <button type="button" onclick="redirect()">Continue</button>
           </div>
         </div>
       </div>
     
       <script>
         function redirect() {
           window.location.href = "/ssm/mca/register";
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

    // res.redirect("/ssm/mca/studentList");
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
            <p>Student Details Updated Successfully!</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/studentList";
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
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

module.exports = exports;

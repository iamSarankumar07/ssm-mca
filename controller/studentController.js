const Student = require("../models/studentModel");
const TemplateModel = require("../models/templateModel");
const authFile = require("../middleware/auth");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const pdf = require("html-pdf");
const moment = require("moment");
const countModel = require("../models/countModel");
const admissionModel = require("../models/admissionModel");
const {bucket} = require("../middleware/adminCredentials");
const studentModel = require("../models/studentModel");
const cloudinary = require('cloudinary').v2;
const subjectCodeModel = require("../models/subjectCodeModel");
const mongoose = require("mongoose");
const axios = require("axios");
const AttendanceModel = require("../models/attendanceModel");
const { verify } = require("jsonwebtoken");
const studyMaterialModel = require("../models/studyMaterial");
const helper = require("../helper");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function calculateCourseDuration(course) {
  const startYear = new Date().getFullYear();
  let duration = 0;

  if (['MCA', 'MBA'].includes(course)) {
    duration = 2;
  } else if (course === 'BCA') {
    duration = 3;
  } else if (['Civil', 'CSE', 'EEE', 'Mechanical', 'ECE', 'BTech'].includes(course)) {
    duration = 4;
  } else {
    throw new Error('Invalid course');
  }

  const endYear = startYear + duration;
  return `${startYear} - ${endYear}`;
}

exports.newStudent = async (req, res) => {
  try {
    const body = req.body;
    body.dob = moment(body.dob).format('DD-MM-YYYY');
    body.admissionDate = moment(body.admissionDate).format('DD-MM-YYYY');

    const [isPhoneExist, isEmailExists] = await Promise.all([
      Student.findOne({ phone: body.phone, isDelete: false, isAlumni: false }),
      Student.findOne({ email: body.email, isDelete: false, isAlumni: false }),
    ]);

    if (isPhoneExist) {
      return res.status(400).json({ success: false, message: 'Phone Number already exists!' });
    }

    if (isEmailExists) {
      return res.status(400).json({ success: false, message: 'Email already exists!' });
    }

    const courseDuration = calculateCourseDuration(body.course);

    const student = new Student({
      ...body,
      year: 'I',
      addressUpdate: true,
      address: {
        address: body.address,
        city: body.city,
        state: body.state,
        pinCode: body.pinCode,
        country: body.country,
      },
      courseDuration: courseDuration,
      tuitionFees: {
        totalFee: Number(body.totalFee) || 0,
        paidFee: 0,
        pendingFee: Number(body.totalFee) || 0,
        status: 'Pending',
        semester: '1',
      },
      examFees: {
        totalFee: 0,
        paidFee: 0,
        pendingFee: 0,
        status: 'Pending',
        semester: '1',
      }
    });

    const studentCount = await countModel.findOne({ name: body.course });
    const totalCount = studentCount.count + 1;
    const studentId = `${moment().format('YY')}${body.course}${totalCount}`;
    await countModel.findByIdAndUpdate(studentCount._id, { count: totalCount });
    student.studentId = studentId;

    const password = student.dob;
    const hashedPassword = await bcrypt.hash(password, 12);
    student.password = hashedPassword;

    if (req.file) {
      try {
        const studentImg = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { public_id: req.file.originalname, resource_type: 'auto', folder: 'student' },
            (error, result) => (error ? reject(error) : resolve(result))
          ).end(req.file.buffer);
        });
        student.imageUrl = studentImg.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary Upload Error:', uploadError);
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    await student.save();

    res.status(201).json({ success: true, message: 'Student Registration Successfully!' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'verifyuserofficial@gmail.com', pass: 'wsdv megz vecp wzen' },
    });

    const mailOptions = {
      from: 'verifyuserofficial@gmail.com',
      to: student.email,
      subject: 'Registration Successful.',
      html: `<!DOCTYPE html>
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
        </html>`
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    console.error('Error during student registration:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  let { studentId, password } = req.body;

  studentId = studentId.trim();
  password = password.trim();
  
  try {
    const student = await Student.findOne({ 
      studentId,
      isDelete: false,
    });

    if (!student) {
      return res.status(200).json({
        success: false,
        message: "Please check your login credentials"
      });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);

    if (!passwordMatch) {
      return res.status(200).json({
        success: false,
        message: "Incorrect Password!"
      });
    }

    const accessToken = await authFile.sToken(student);

    if (student.isAlumni) {
      res.cookie("access-token-alumni", accessToken, {
        maxAge: 86400000
      });
    } else {
      res.cookie("access-token-student", accessToken, {
        maxAge: 86400000
      });
    }


    return res.status(200).json({
      success: true,
      data: {
        studentId: student.studentId,
        name: student.name,
        year: student.year,
        course: student.course,
        isAlumni: student.isAlumni,
      },
      message: "Loggined Successfully!"
    });
  } catch (err) {
    console.log("Error logging in:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.studentForgotPassword = async (req, res) => {
  let body = req.body;
  try {
    let studentId = body.studentId;
    let studentData = await Student.findOne({ studentId: studentId, isDelete: false });
    if (!studentData) {
      return res.status(500).json({
        success: false,
        message: "Student not found!"
      });
    }

    let OTP = Math.floor(100000 + Math.random() * 900000);

    console.log(OTP);

    let OTPString = OTP.toString();

    studentData.forgotOtp = OTPString;
    await studentData.save();

    res.status(200).json({
      success: true,
      message: "OTP Sent successfully!"
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      to: studentData.email,
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
                <p>Hello ${studentData.name},</p>
                <p>You have requested to reset your password. Please use the following OTP to reset your password:</p>
                <p class="otp-code">${OTPString}</p>
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

    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log("Error sending OTP email:", err);
        return res.status(500).json({
          success: false,
          message: "Error while sending OTP"
        });
      }
      console.log("OTP sent successfully");
    });

    // res.render("studentForgotOtp", { studentData });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
    // return res.send(
    //   '<script>alert("forgot password Failed! - Internal Server Error"); window.location.href = "/v1/api/student/forgotPassword";</script>'
    // );
  }
};

exports.resetPassword = async (req, res) => {
  try {
    let user = await Student.findOne({
      studentId: req?.body?.studentId,
      isDelete: false,
    });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Student not found!"
      });
    }

    if (user.forgotOtp !== req?.body?.otp) {
      return res.status(200).json({
        success: false,
        message: "Incorrect OTP"
      });
    } else {
      let saltRounds = 12;
      let hashedPassword = await bcrypt.hash(req?.body?.newPassword, saltRounds);
      user.password = hashedPassword;

      await user.save();
      return res.status(200).json({
        success: true,
        message: "Password reset successful!."
      });
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    })
  }
};

exports.studentForgotOtp = async (req, res) => {
  let { otp, dob } = req.body;
  try {
    let student = await Student.findOne({ forgotOtp: otp });

    if (!student) {
      console.log("Incorrect OTP");
      return res.send('<script>alert("Incorrect OTP or OTP Expired!"); window.location.href = "/v1/api/student/forgotPassword";</script>');
    }

    let password = moment(dob).format("DD-MM-YYYY")

    let saltRounds = 12;
    let hashedPassword = await bcrypt.hash(password, saltRounds);

    student.password = hashedPassword;
    student.forgotOtp = null;

    await student.save();

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
            color: #28a745;
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
              <button type="button" onclick="redirect()">Login</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/v1/api/signin";
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
    return res.send(
      '<script>alert("forgot password Failed! - Internal Server Error"); window.location.href = "/v1/api/register";</script>'
    );
  }
}

exports.deleteStudent = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Student.findByIdAndUpdate(userId, { isDelete: true });
    res.redirect("/v1/api/studentList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.moveStudents = async (req, res) => {
  let body = req.body;
  let currentYear = body.year;
  let graduationYear = null;

  if (body?.type === "Alumni") {
    graduationYear = body?.graduationYear[0];
  }

  try {
    if (body?.type === "Alumni") {
      let query = { year: currentYear, isDelete: false };
      let result = await Student.updateMany(query, {
        $set: {
          isAlumni: true,
          graduationYear: graduationYear,
          year: null,
          tutionDueDate: null,
          examDueDate: null,
          examPaymentStatus: null,
          examTotalFee: null,
          examPendingFee: null,
          totalFee: null,
          pendingFee: null,
        },
      });
      res.json({
        success: true,
        message: "Student moved successfully!"
      });
    } else {
      const query = { year: currentYear, isDelete: false };
      const result = await Student.updateMany(query, {
        $set: {
          year: body?.type,
          tutionDueDate: null,
          examDueDate: null,
          examPaymentStatus: null,
          examTotalFee: null,
          examPendingFee: null,
          totalFee: null,
          pendingFee: null,
          updatedAt: Date.now(),
        },
      });
      res.json({
        success: true,
        message: "Student moved successfully!"
      });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to move students!"
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    let body = req.body;
    let userId = body.userId;

    let studentImg;
    
    if (req.file) {
      let fileName = body.name.replace(/\s+/g, "_") + "_" + Date.now();
      studentImg = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            public_id: fileName,
            resource_type: "auto",
            folder: "student",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(req.file.buffer);
      });
    }
    
    const student = await Student.findById(userId);
    let imageUrl = student?.imageUrl;
    
    if (studentImg) {
      imageUrl = studentImg.secure_url;
    }

    await Student.findByIdAndUpdate(userId, {
      name: body.name,
      studentId: student.studentId,
      registerNumber: body.registerNumber,
      gender: body.gender,
      aadhaarNum: body.aadhaarNum,
      dob: body.dob,
      phone: body.phone,
      course: body.course,
      email: body.email,
      address: {
        address: body.address,
        city: body.city,
        state: body.state,
        pinCode: body.pinCode,
        country: body.country,
      },
      tuitionFees: {
        totalFee: Number(body.totalFee) || 0,
        paidFee: 0,
        pendingFee: Number(body.totalFee) || 0,
        status: 'Pending',
      },
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      parentalIncome: body.parentalIncome,
      previousInstitution: body.previousInstitution,
      previousMarks: body.previousMarks,
      bridgeCourse: body.bridgeCourse,
      emergencyContact: body.emergencyContact,
      emergencyContactRelationship: body.emergencyContactRelationship,
      emergencyPhone: body.emergencyPhone,
      bloodGroup: body.bloodGroup,
      nationality: body.nationality,
      religion: body.religion,
      hostelRequired: body.hostelRequired,
      transportation: body.transportation,
      scholarship: body.scholarship,
      imageUrl: imageUrl
    });

    res.status(200).json({
      success: true,
      message: "Student updated successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!",
    })
  }
};

exports.sendAddressUpdateReq = async (req, res) => {
  let data = req.body;
  let selectedYear = data.year;
  let studentId = data.studentId;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "verifyuserofficial@gmail.com",
      pass: "wsdv megz vecp wzen",
    },
  });

  const sendMail = (studentEmail, studentName) => {
    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      to: studentEmail,
      subject: "Address Update Option Enabled",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Address Update Option Enabled</title>
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
            <h1>Address Update Option Enabled</h1>
            <p>Dear ${studentName},</p>
            <p>We are pleased to inform you that the address update option has been enabled for your account. You can now log into your student portal and update your address information in your profile.</p>
            <p>If you have any questions or need further assistance, please feel free to <a href="mailto:iamsarankumar@outlook.in" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
            <p>Best regards,<br>Saran Kumar</p>
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
        console.log(err, "Email Sent Failed...");
      } else {
        console.log(`Email Sent Successfully to ${studentName} - ${studentEmail}`);
      }
    });
  };

  try {
    if (studentId) {
      let query = { studentId: studentId };
      const result = await Student.findOneAndUpdate(query, {
        $set: {
          addressUpdate: false,
        },
      });

      if (!result) {
        return res.status(404).send(`
          <script>
            alert("Student not found");
            window.location.href = "/v1/api/addressUpdateReq";
          </script>
        `);
      }

      sendMail(result.email, result.name);
      let title = "Address Update Option Enabled";
      let message = `Dear ${result.name} your address update option has been enabled. Please log in to your student portal and update your address information in your profile.`;
      helper.sendNotification(title, message, result._id);
    } else if (selectedYear) {
      const query = { year: selectedYear };
      const result = await Student.updateMany(query, {
        $set: {
          addressUpdate: false,
        },
      });

      if (result.matchedCount === 0) {
        return res.status(404).send(`
          <script>
            alert("No students found for the given year");
            window.location.href = "/v1/api/addressUpdateReq";
          </script>
        `);
      }

      const students = await Student.find(query);
      students.forEach((student, index) => {
        setTimeout(() => {
          sendMail(student.email, student.name);
        }, index * 500);
      });
    } else {
      return res.status(400).send(`
        <script>
          alert("Invalid request data");
          window.location.href = "/v1/api/addressUpdateReq";
        </script>
      `);
    }

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
            color: #28a745;
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
            <p>Address Update Request Sent!</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/v1/api/addressUpdateReq";
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
    res.status(500).send(`
      <script>
        alert("Internal Server Error");
        window.location.href = "/v1/api/studentList";
      </script>
    `);
  }
};

exports.addressUpdate = async (req, res) => {
  try {
    let data = req.body;
    let userId = req.params.userId;


    await Student.findByIdAndUpdate(userId, {
      address: {
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        country: data.country
      },
      addressUpdate: data.addressUpdate,
    });

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
            color: #28a745;
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
            <p>Address Updated Successfully!</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/v1/api/studentProfile";
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

exports.requestChange = async (req, res) => {
  let { newName, newEmail, studentId, newDob, newPhone } = req.body;
  newDob = moment(newDob).format("DD-MM-YYYY")

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
          color: #28a745;
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
          <p>Profile Update Request Sent</p>
          <div class="button-container">
            <button type="button" onclick="redirect()">Continue</button>
          </div>
        </div>
      </div>
    
      <script>
        function redirect() {
          window.location.href = "/v1/api/studentProfile";
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

  try {
      let studentData = await Student.findOneAndUpdate(
          { studentId: studentId },
          {
              $set: {
                  editRequest: {
                      newName,
                      newPhone,
                      newEmail,
                      newDob,
                      status: 'requested'
                  }
              }
          },
          { new: true }
      );

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error in Profile Update Request' });
  }
};

exports.requestChangeTu = async (req, res) => {
  let { studentId, txnIdTu, paidDateTu, paidAmountTu } = req.body;

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  let stdData = await Student.findOne({ studentId: studentId });

  let reqStatusCheck = stdData.tuEditRequest.status === "requested";

  if (reqStatusCheck) {
    return res.send(
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
            color: #28a745;
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
            <p>Tuition Fees Update Request Sent</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/v1/api/studentProfile";
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
  }

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
          color: #28a745;
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
          <p>Tuition Fees Update Request Sent</p>
          <div class="button-container">
            <button type="button" onclick="redirect()">Continue</button>
          </div>
        </div>
      </div>
    
      <script>
        function redirect() {
          window.location.href = "/v1/api/studentProfile";
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

  paidDateTu = moment(paidDateTu).format("DD-MM-YYYY");

  let fileName = req.file.originalname;

  let studentData = await Student.findOne({studentId : studentId});
  let currentPaid = Number(studentData.paidFeeTu) + Number(paidAmountTu);
  let totalFee = Number(studentData.totalFee);
  let newTuPendingFee = Number(studentData.pendingFee) - Number(paidAmountTu);
  let newTuStatus = totalFee === currentPaid ? "Paid" : "Partial";
  // let newTuPendingFee = currentPaid - paidAmountTu;
  let newTuPending = newTuPendingFee.toString();
  let payMode = req.body.payMode;

  const blob = bucket.file(`payment/${fileName}`);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  let imageUrl = await new Promise((resolve, reject) => {
    blobStream.on("error", (err) => {
      console.log("Error during upload:", err);
      reject("Error uploading file.");
    });

    blobStream.on("finish", async () => {
      try {
        await blob.makePublic();
        resolve(blob.publicUrl());
      } catch (err) {
        console.log("Error in uploadImage:", err);
        reject("Error making file public.");
      }
    });

    blobStream.end(req.file.buffer);
  });

  try {
      let studentData = await Student.findOneAndUpdate(
          { studentId: studentId },
          {
              $set: {
                  tuEditRequest: {
                      newTuPending,
                      newTuStatus,
                      status: 'requested',
                      txnIdTu: txnIdTu,
                      paidDateTu: paidDateTu,
                      paidAmountTu: paidAmountTu,
                      payMode: payMode,
                      imageUrl: imageUrl
                  },
              }
          },
          { new: true }
      );
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error in Tuition Update Request' });
  }
};

exports.requestChangeEx = async (req, res) => {
  let { paidAmountEx, studentId, txnIdEx, paidDateEx } = req.body;
  paidDateEx = moment(paidDateEx).format("DD-MM-YYYY");

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  let stdData = await Student.findOne({ studentId: studentId });

  let reqStatusCheck = stdData.exEditRequest.status === "requested";

  if (reqStatusCheck) {
    return res.send(
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
            color: #28a745;
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
            <p>Exam Fees Update Request Sent</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/v1/api/studentProfile";
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
  }

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
          color: #28a745;
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
          <p>Exam Fees Update Request Sent</p>
          <div class="button-container">
            <button type="button" onclick="redirect()">Continue</button>
          </div>
        </div>
      </div>
    
      <script>
        function redirect() {
          window.location.href = "/v1/api/studentProfile";
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

  let fileName = req.file.originalname;

  let studentData = await Student.findOne({studentId : studentId});
  let currentPaid = Number(studentData.paidFeeEx) + Number(paidAmountEx);
  let totalFee = Number(studentData.examTotalFee);
  let newTuPendingFee = Number(studentData.examPendingFee) - Number(paidAmountEx);
  let newExStatus = totalFee === currentPaid ? "Paid" : "Partial";
  // let newTuPendingFee = totalFee - paidAmountEx;
  let newExPending = newTuPendingFee.toString();
  let newTuPending = newTuPendingFee.toString();
  let payMode = req.body.payMode;

  const blob = bucket.file(`payment/${fileName}`);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  let imageUrl = await new Promise((resolve, reject) => {
    blobStream.on("error", (err) => {
      console.log("Error during upload:", err);
      reject("Error uploading file.");
    });

    blobStream.on("finish", async () => {
      try {
        await blob.makePublic();
        resolve(blob.publicUrl());
      } catch (err) {
        console.log("Error in uploadImage:", err);
        reject("Error making file public.");
      }
    });

    blobStream.end(req.file.buffer);
  });

  try {
      let studentData = await Student.findOneAndUpdate(
          { studentId: studentId },
          {
              $set: {
                  exEditRequest: {
                      newExPending,
                      newExStatus,
                      status: 'requested',
                      txnIdEx: txnIdEx,
                      paidDateEx: paidDateEx,
                      paidAmountEx: paidAmountEx,
                      payMode: payMode,
                      imageUrl: imageUrl
                  },
              }
          },
          { new: true }
      );
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error in Exam Update Request' });
  }
};

exports.approveAndReject = async (req, res) => {
  let data = req.body;
  let registerNumber = data.registerNumber
  let action = data.action;
  let status;
  let statusRes;
  let student;

  if (action === "Approve") {
    status = "Approved"
  } else if (action === "Reject") {
    status = "Rejected"
  }

  try {
    if (status === "Approved"){
      student = await Student.findOne({registerNumber: registerNumber});

      let password = student.editRequest.newDob.toString();

      let saltRounds = 12;
      let hashedPassword = await bcrypt.hash(password, saltRounds);

      if (student.editRequest && student.editRequest.status === 'requested') {
          student.name = student.editRequest.newName;
          student.phone = student.editRequest.newPhone;
          student.dob = student.editRequest.newDob;
          student.email = student.editRequest.newEmail;
          student.password = hashedPassword;
          student.editRequest = null;
          await student.save();
        };
        statusRes = "Approved";
    } else if (status === "Rejected"){
      student = await Student.findOne({registerNumber: registerNumber});

      if (student.editRequest && student.editRequest.status === 'requested') {
          student.editRequest = null;
          await student.save();
        }
        statusRes = "Rejected"
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'verifyuserofficial@gmail.com',
        pass: 'wsdv megz vecp wzen',
      },
    });

    const mailOptions = {
      from: 'verifyuserofficial@gmail.com',
      to: student.email,
      subject: 'Profile Update Request',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Profile Update Request Status</title>
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
              .status {
                  margin-bottom: 15px;
                  text-align: center;
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
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Profile Update Request 📝</h1>
              <div class="status">
                  <p>Dear ${student.name},</p>
                  <p>Your profile update request has been ${statusRes}.</p>
                  <p>If you have any questions or need further assistance, please feel free to <a href="mailto:saran@outlook.in" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
                  <p>Best regards,<br>Sarankumar</p>
              </div>
              <div class="footer">
                  This is an automated message. Please do not reply to this email.
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

    return res.redirect('/v1/api/reviewRequest')

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.approveAndRejectTu = async (req, res) => {
  let data = req.body;
  let studentId = data.studentId
  let action = data.action;
  let status;
  let statusRes;
  let student;
  let rejectReason = data?.rejectReason || "";

  if (action === "Approve") {
    status = "Approved"
  } else if (action === "Reject") {
    status = "Rejected"
  }

  try {
    if (status === "Approved"){
      student = await Student.findOne({studentId: studentId});

      let totalFee = Number(student.totalFee);
      let pendingFee = Number(student.pendingFee);
      let totalPaidFee = Number(totalFee) - Number(pendingFee);
      let currentTotalFee = Number(totalPaidFee) + Number(student.tuEditRequest.paidAmountTu);
      let currentPendingFee = totalFee - currentTotalFee;
      let paidFeeTu = currentTotalFee.toString();
      let tuPendingFee = currentPendingFee.toString();

      if (student.tuEditRequest && student.tuEditRequest.status === 'requested') {
          student.pendingFee = tuPendingFee;
          student.paidFeeTu = paidFeeTu;
          student.paymentStatus = student.tuEditRequest.newTuStatus;
          student.tuEditRequest = null;
          await student.save();
        };
        statusRes = "Approved";
    } else if (status === "Rejected"){
      student = await Student.findOne({studentId: studentId});

      if (student.tuEditRequest && student.tuEditRequest.status === 'requested') {
          student.tuEditRequest = null;
          await student.save();
        }
        statusRes = "Rejected"
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'verifyuserofficial@gmail.com',
        pass: 'wsdv megz vecp wzen',
      },
    });

    const mailOptions = {
      from: 'verifyuserofficial@gmail.com',
      to: student.email,
      subject: 'Profile Update Request',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Profile Update Request Status</title>
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
              .status {
                  margin-bottom: 15px;
                  text-align: center;
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
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Tuition Fee Update Request 📝</h1>
              <div class="status">
                  <p>Dear ${student.name},</p>
                  <p>Your Tuition Fee Update Request has been ${statusRes}.</p>
                  ${statusRes === "Rejected" ? `
                    <p><strong>Reason for rejection:</strong> ${rejectReason}</p>
                ` : ''}
                  <p>If you have any questions or need further assistance, please feel free to <a href="mailto:saran@outlook.in" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
                  <p>Best regards,<br>SSM COLLEGE OF ENGINEERING</p>
              </div>
              <div class="footer">
                  This is an automated message. Please do not reply to this email.
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

    return res.redirect('/v1/api/reviewRequestTu')

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.approveAndRejectEx = async (req, res) => {
  let data = req.body;
  let studentId = data.studentId
  let action = data.action;
  let status;
  let statusRes;
  let student;
  let rejectReason = data?.rejectReason || "";

  if (action === "Approve") {
    status = "Approved"
  } else if (action === "Reject") {
    status = "Rejected"
  }

  try {
    if (status === "Approved"){
      student = await Student.findOne({studentId: studentId});

      let totalFee = Number(student.examTotalFee);
      let pendingFee = Number(student.examPendingFee);
      let totalPaidFee = Number(totalFee) - Number(pendingFee);
      let currentTotalFee = Number(totalPaidFee) + Number(student.exEditRequest.paidAmountEx);
      let currentPendingFee = totalFee - currentTotalFee;
      let paidFeeEx = currentTotalFee.toString();
      let examPendingFee = currentPendingFee.toString();


      if (student.exEditRequest && student.exEditRequest.status === 'requested') {
        student.examPendingFee = examPendingFee;
        student.paidFeeEx = paidFeeEx;
        student.examPaymentStatus = student.exEditRequest.newExStatus;
        student.exEditRequest = null;
        await student.save();
        };
        statusRes = "Approved";
    } else if (status === "Rejected"){
      student = await Student.findOne({studentId: studentId});

      if (student.exEditRequest && student.exEditRequest.status === 'requested') {
          student.exEditRequest = null;
          await student.save();
        }
        statusRes = "Rejected"
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'verifyuserofficial@gmail.com',
        pass: 'wsdv megz vecp wzen',
      },
    });

    const mailOptions = {
      from: 'verifyuserofficial@gmail.com',
      to: student.email,
      subject: 'Profile Update Request',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Profile Update Request Status</title>
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
              .status {
                  margin-bottom: 15px;
                  text-align: center;
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
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Exam Fee Update Request 📝</h1>
              <div class="status">
                  <p>Dear ${student.name},</p>
                  <p>Your Exam Fee Update Request has been ${statusRes}.</p>
                  ${statusRes === "Rejected" ? `
                    <p><strong>Reason for rejection:</strong> ${rejectReason}</p>
                ` : ''}
                  <p>If you have any questions or need further assistance, please feel free to <a href="mailto:saran@outlook.in" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
                  <p>Best regards,<br>SSM COLLEGE OF ENGINEERING</p>
              </div>
              <div class="footer">
                  This is an automated message. Please do not reply to this email.
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

    return res.redirect('/v1/api/reviewRequestEx')

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.studentDownload = async (req, res) => {
  let data = req.body;
  try {
    let [studentsData, maleRecords, femaleRecords, totalRecords] = await Promise.all([
      Student.find({ isDelete: false, isAlumni: false, year: data.year }),
      Student.find({ isDelete: false, isAlumni: false, year: data.year, gender: "Male" }).countDocuments(),
      Student.find({ isDelete: false, isAlumni: false, year: data.year, gender: "Female" }).countDocuments(),
      Student.find({ isDelete: false, isAlumni: false, year: data.year }).countDocuments()
    ]);

    let sortedList = studentsData.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    let templateData = {
      studentsData: sortedList,
      maleRecords: maleRecords,
      femaleRecords: femaleRecords,
      totalRecords: totalRecords
    };

    let dbTemplate = await TemplateModel.findOne({ name: "STUDENTS_LIST_PDF" });
    let attachment = eval("`" + dbTemplate.content + "`");

    if (data.isPdf) {
      pdf.create(attachment, {
        childProcessOptions: { env: { OPENSSL_CONF: "/dev/null" } },
        orientation: "portrait",
        width: "8.27in",
        height: "11.69in",
        timeout: "100000",
      }).toBuffer((err, buffer) => {
        if (err) {
          console.log("Error: " + err);
          return res.status(500).send({ success: false, message: err.message });
        }
        res.writeHead(200, {
          "Content-Length": Buffer.byteLength(buffer),
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename = MCA - ${data.year} Students list.pdf`
        });
        res.end(buffer);
      });
    } else {
      res.status(400).send({ success: false, message: "isPdf flag is required to download PDF" });
    }
  } catch (err) {
    console.log(err.message, err);
    return res.status(500).send({ success: false, message: err.message });
  }
};

exports.studentTuitionDownload = async (req, res) => {
  let data = req.body;
  try {
    let [studentsData, paidRecords, pendingRecords, totalRecords] = await Promise.all([
      Student.find({ isDelete: false, isAlumni: false, year: data.year }),
      Student.find({ isDelete: false, isAlumni: false, year: data.year, paymentStatus: "Paid" }).countDocuments(),
      Student.find({ isDelete: false, isAlumni: false, year: data.year, paymentStatus: { $in: ["Pending", "Partial"] } }).countDocuments(),
      Student.find({ isDelete: false, isAlumni: false, year: data.year }).countDocuments()
    ]);

    let sortedList = studentsData.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    let templateData = {
      studentsData: sortedList,
      paidRecords: paidRecords,
      pendingRecords: pendingRecords,
      totalRecords: totalRecords,
      dueDate: studentsData[0]?.tutionDueDate
    };

    let dbTemplate = await TemplateModel.findOne({ name: "TUITION_FEE_PDF" });
    let attachment = eval("`" + dbTemplate.content + "`");

    if (data.isPdf) {
      pdf.create(attachment, {
        childProcessOptions: { env: { OPENSSL_CONF: "/dev/null" } },
        orientation: "portrait",
        width: "8.27in",
        height: "11.69in",
        timeout: "100000",
      }).toBuffer((err, buffer) => {
        if (err) {
          console.log("Error: " + err);
          return res.status(500).send({ success: false, message: err.message });
        }
        res.writeHead(200, {
          "Content-Length": Buffer.byteLength(buffer),
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename = MCA - ${data.year} Tuition fees.pdf`
        });
        res.end(buffer);
      });
    } else {
      res.status(400).send({ success: false, message: "isPdf flag is required to download PDF" });
    }
  } catch (err) {
    console.log(err.message, err);
    return res.status(500).send({ success: false, message: err.message });
  }
};

exports.studentExamDownload = async (req, res) => {
  let data = req.body;
  try {
    let [studentsData, paidRecords, pendingRecords, totalRecords] = await Promise.all([
      Student.find({ isDelete: false, isAlumni: false, year: data.year }),
      Student.find({ isDelete: false, isAlumni: false, year: data.year, examPaymentStatus: "Paid" }).countDocuments(),
      Student.find({ isDelete: false, isAlumni: false, year: data.year, examPaymentStatus: { $in: ["Pending", "Partial"] } }).countDocuments(),
      Student.find({ isDelete: false, isAlumni: false, year: data.year }).countDocuments()
    ]);

    let sortedList = studentsData.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    let templateData = {
      studentsData: sortedList,
      paidRecords: paidRecords,
      pendingRecords: pendingRecords,
      totalRecords: totalRecords,
      dueDate: studentsData[0]?.examDueDate
    };

    let dbTemplate = await TemplateModel.findOne({ name: "EXAM_FEE_PDF" });
    let attachment = eval("`" + dbTemplate.content + "`");

    if (data.isPdf) {
      pdf.create(attachment, {
        childProcessOptions: { env: { OPENSSL_CONF: "/dev/null" } },
        orientation: "portrait",
        width: "8.27in",
        height: "11.69in",
        timeout: "100000",
      }).toBuffer((err, buffer) => {
        if (err) {
          console.log("Error: " + err);
          return res.status(500).send({ success: false, message: err.message });
        }
        res.writeHead(200, {
          "Content-Length": Buffer.byteLength(buffer),
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename = MCA - ${data.year} Exam fees.pdf`
        });
        res.end(buffer);
      });
    } else {
      res.status(400).send({ success: false, message: "isPdf flag is required to download PDF" });
    }
  } catch (err) {
    console.log(err.message, err);
    return res.status(500).send({ success: false, message: err.message });
  }
};

exports.studentAlumniDownload = async (req, res) => {
  try {
    let selectedYear = req.query.year || null;
    let query = { isDelete: false, isAlumni: true };
    
    if (selectedYear && selectedYear !== 'All') {
      query.graduationYear = selectedYear;
    }

    let [studentsData, maleRecords, femaleRecords, totalRecords] = await Promise.all([
      Student.find(query),
      Student.countDocuments({ ...query, gender: "Male" }),
      Student.countDocuments({ ...query, gender: "Female" }),
      Student.countDocuments(query)
    ]);

    let orderedData = studentsData.sort((a, b) => {
      if (b.graduationYear === a.graduationYear) {
        return a.name.localeCompare(b.name);
      }
      return b.graduationYear - a.graduationYear;
    });

    let templateData = {
      studentsData: orderedData,
      maleRecords: maleRecords,
      femaleRecords: femaleRecords,
      totalRecords: totalRecords
    };

    let dbTemplate = await TemplateModel.findOne({ name: "ALUMNI_LIST_PDF" });
    let attachment = eval("`" + dbTemplate.content + "`");

    if (req.body.isPdf) {
      const pdfBuffer = await new Promise((resolve, reject) => {
        pdf.create(attachment, {
          childProcessOptions: { env: { OPENSSL_CONF: "/dev/null" } },
          orientation: "portrait",
          width: "8.27in",
          height: "11.69in",
          timeout: "100000",
        }).toBuffer((err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
      });

      return { success: true, buffer: pdfBuffer };
    } else {
      return { success: false, message: "isPdf is required for download PDF" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: err.message };
  }
};

exports.getDetails = async (req, res) => {
  let data = await Student.find({});
  return res.json(data)
} 

exports.insertManyStudents = async (req, res) => {
  try {
      let students = req.body.students;

      let result = await Student.insertMany(students);
      
      res.status(200).json({
          message: 'Students inserted successfully',
          result: result
      });
  } catch (err) {
      res.status(500).json({
          message: 'An error occurred',
          err: err.message
      });
  }
};

exports.admissionApply = async (req, res) => {
  try {
    const body = req.body;
    let existingEmail = await admissionModel.findOne({ email: body.email });
    if (existingEmail) {
      return res.send(
        '<script>alert("Email already registered!"); window.location.href = "/";</script>'
      );
    }

    let existingPhone = await admissionModel.findOne({ email: body.phone });

    if (existingPhone) {
      return res.send(
        '<script>alert("Phone number already registered!"); window.location.href = "/";</script>'
      );
    }

    body.dob = moment(body.dob).format("DD-MM-YYYY");

    const admission = new admissionModel({
      name: body.name,
      fatherName: body.fatherName,
      gender: body.gender,
      dob: body.dob,
      phone: body.phone,
      email: body.email,
      address: body.address,
      program: body.program,
      previousQualification: body.previousQualification,
      tenthMarks: body.tenthMarks,
      twelfthMarks: body.twelfthMarks,
      ugPercentage: body.ugPercentage ? body.ugPercentage : 0,
      emergencyContact: body.emergencyContact,
      emergencyPhone: body.emergencyPhone,
    });

    let admissionRefNoCount = await countModel.findOne({
      name: "admissionRefNo",
    });
    let count = admissionRefNoCount.count;
    let date = Date.now();
    let prefix = moment(date).format("YY");
    let center = "SSMREF";
    let totalCount = count + 1;
    let refNo = `${prefix}${center}${totalCount}`;

    await countModel.findByIdAndUpdate(admissionRefNoCount._id.toString(), {
      $set: { count: totalCount },
    });

    admission.appliedDate = moment(date).format("DD-MM-YYYY");
    admission.refNo = refNo.toString();

    let admissionData = await admission.save();

    if (admissionData) {
      const transPorter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "verifyuserofficial@gmail.com",
          pass: "wsdv megz vecp wzen",
        },
      });

      const mailOptions = {
        from: "verifyuserofficial@gmail.com",
        to: admission.email,
        subject: "Application Received",
        html: `
          <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Application Received - SSM College of Engineering</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
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
            font-size: 28px;
            color: #007bff;
            margin-bottom: 20px;
            text-align: center;
          }
          p {
            margin-bottom: 15px;
            text-align: justify;
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
          <h1>Application Received 🎓</h1>
          <p>Dear ${admission.name},</p>
          <p>Thank you for applying to <strong>SSM College of Engineering</strong>! We have successfully received your application for admission.</p>
          <p>Your application is currently under review, and our admissions team will reach out to you shortly with the next steps. Here are your application details for reference:</p>
          <ul>
            <li><strong>Application ID:</strong> ${refNo}</li>
            <li><strong>Program Applied:</strong> ${admission.program}</li>
            <li><strong>Submission Date:</strong> ${admission.appliedDate}</li>
          </ul>
          <p>If you have any questions or need further assistance, feel free to <a href="mailto:iam@sarankumar@outlook.in">contact us</a> or visit our <a href="https://ssm-mca.onrender.com/">admissions portal</a>.</p>
          <p>We are excited to have you as a prospective member of our community and wish you the best of luck!</p>
          <p>Warm regards,<br>Admissions Office<br><strong>SSM College of Engineering</strong></p>
          <div class="footer">
            This is an automated message. Please do not reply directly to this email.
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
    }
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
          color: #28a745;
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
          <p>Admission application submited successfully!</p>
          <div class="button-container">
            <button type="button" onclick="redirect()">Continue</button>
          </div>
        </div>
      </div>
    
      <script>
        function redirect() {
          window.location.href = "/";
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
    console.log("error in newAdmission : " + err);
    return res.send(
      '<script>alert("Admission aplication Failed! due to Internal Server Error"); window.location.href = "/";</script>'
    );
  }
};

exports.getStudentsList = async (req, res) => {
  let body = req.body;
  let course = body.course;
  let year = body.year;
  try {

    res.render("studentList", {
      year: year,
      course: course
    });
  } catch (err) {
    console.log("Error in getStudentsList: " + err);
    return res.status(404).render('error', { message: "Unable to fetch students list! Please try again later." });
  }
};

exports.getStudentsData = async (req, res) => {
  let body = req.body;
  let course = body.course;
  let year = body.year;
  try {
    const studentsData = await Student.find({
      isDelete: false,
      isAlumni: false,
      year: year,
      course: course
    });

    let studentsCount = studentsData.length;

    let sortedStudents = studentsData.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    const maleStudentsCount = studentsData.filter(
      (student) => student.gender === "Male"
    ).length;

    const femaleStudentsCount = studentsData.filter(
      (student) => student.gender === "Female"
    ).length;

    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      sortedStudents: sortedStudents,
      studentsCount: studentsCount,
      maleStudentsCount: maleStudentsCount,
      femaleStudentsCount: femaleStudentsCount,
      year: year,
      course: course
    });
  } catch (err) {
    console.log("Error in getFirstYearStudentsList: " + err);
    res.status(500).json({
      success: false,
      sortedStudents: [],
      studentsCount: 0,
      maleStudentsCount: 0,
      femaleStudentsCount: 0,
      year: year,
      course: course,
      message: "Internal Server Error!"
    });
  }
};

exports.getSecondYearStudentsListMCA = async (req, res) => {
  try {
    const studentsData = await Student.find({
      isDelete: false,
      isAlumni: false,
      year: "II"
    });

    let studentsCount = studentsData.length;

    let sortedStudents = studentsData.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    const maleStudentsCount = studentsData.filter(
      (student) => student.gender === "Male"
    ).length;

    const femaleStudentsCount = studentsData.filter(
      (student) => student.gender === "Female"
    ).length;

    res.render("studentList", {
      sortedStudents,
      studentsCount,
      maleStudentsCount,
      femaleStudentsCount,
      year: "II"
    });
  } catch (err) {
    console.log("Error in getSecondYearStudentsList: " + err);
  }
};

exports.getStudentExamResults = async (req, res) => {
  try {
    const studentData = await studentModel.findOne({
      studentId: req.student.studentId
    }).lean();

    if (!studentData) {
      return res.status(404).render('error', { message: "Student not found" });
    }

    async function getSubjectNames(examResults) {
      const subjectCodes = examResults.map(result => result.subjectCode);
      const subjects = await subjectCodeModel.find({ subjectCode: { $in: subjectCodes } }).lean();

      const subjectMap = {};
      subjects.forEach(subject => {
        subjectMap[subject.subjectCode] = subject.subjectName;
      });

      return examResults.map(result => ({
        ...result,
        subjectName: subjectMap[result.subjectCode] || "Unknown Subject"
      }));
    }

    async function groupBySemester(examResults) {
      const resultsWithNames = await getSubjectNames(examResults);
      return resultsWithNames.reduce((acc, result) => {
        acc[result.semester] = acc[result.semester] || [];
        acc[result.semester].push(result);
        return acc;
      }, {});
    }

    studentData.groupedExamResults = await groupBySemester(studentData.examResults || []);

    let passedCount = 0;
    let failedCount = 0;

    (studentData.examResults || []).forEach(result => {
      if (result.result.toUpperCase() === "PASS") {
        passedCount++;
      } else {
        failedCount++;
      }
    });

    res.render('studentProfileAcademic', {
      student: studentData,
      passedCount,
      failedCount
    });

  } catch (err) {
    console.log("Error in getStudentExamResults: " + err);
    res.status(500).render('error', { message: "Internal Server Error. Please try again later" });
  }
};

exports.getAcademicStudentsList = async (req, res) => {
  let body = req.body;
  let year = body.year;
  let course = body.course;
  try {
    res.render("academicStudentList", {
      year: year,
      course: course,
    });
  } catch (error) {
    console.log("Error fetching students:", error);
    return res
      .status(404)
      .render("error", {
        message: "Internal Server Error! Please try again later.",
      });
  }
};

exports.studentsAcademicRecords = async (req, res) => {
  let body = req.body;
  let year = body.year;
  let course = body.course;
  try {
    const studentsData = await studentModel
      .find({ year: year, isDelete: false, isAlumni: false, course: course })
      .lean();

    async function getSubjectNames(examResults) {
      const subjectCodes = examResults.map((result) => result.subjectCode);
      const subjects = await subjectCodeModel
        .find({ subjectCode: { $in: subjectCodes } })
        .lean();

      const subjectMap = {};
      subjects.forEach((subject) => {
        subjectMap[subject.subjectCode] = subject.subjectName;
      });

      return examResults.map((result) => ({
        ...result,
        subjectName: subjectMap[result.subjectCode] || "Unknown Subject",
      }));
    }

    async function groupBySemester(examResults) {
      const resultsWithNames = await getSubjectNames(examResults);
      return resultsWithNames.reduce((acc, result) => {
        acc[result.semester] = acc[result.semester] || [];
        acc[result.semester].push(result);
        return acc;
      }, {});
    }

    for (const student of studentsData) {
      student.groupedExamResults = await groupBySemester(
        student.examResults || []
      );
    }

    let studentsCount = studentsData.length;

    res.status(200).json({
      success: true,
      studentsData,
      message: null,
      error: null,
      year: year,
      course: course,
      studentsCount: studentsCount,
    });
  } catch (err) {
    console.log("Error fetching students:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.getFirstYearStudentsForAcademic = async (req, res) => {
    try {
        const studentsData = await studentModel.find({ year: "I", isDelete: false, isAlumni: false }).lean();

        async function getSubjectNames(examResults) {
            const subjectCodes = examResults.map(result => result.subjectCode);
            const subjects = await subjectCodeModel.find({ subjectCode: { $in: subjectCodes } }).lean();

            const subjectMap = {};
            subjects.forEach(subject => {
                subjectMap[subject.subjectCode] = subject.subjectName;
            });

            return examResults.map(result => ({
                ...result,
                subjectName: subjectMap[result.subjectCode] || "Unknown Subject"
            }));
        }

        async function groupBySemester(examResults) {
            const resultsWithNames = await getSubjectNames(examResults);
            return resultsWithNames.reduce((acc, result) => {
                acc[result.semester] = acc[result.semester] || [];
                acc[result.semester].push(result);
                return acc;
            }, {});
        }

        for (const student of studentsData) {
            student.groupedExamResults = await groupBySemester(student.examResults || []);
        }

        let studentsCount = studentsData.length;
        res.render("academicStudentList", { 
            studentsData, 
            message: null, 
            error: null, 
            year: "I", 
            studentsCount 
        });

    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).render("academicStudentList", { 
            studentsData: [], 
            message: null, 
            error: "Error fetching students.", 
            year: "I", 
            studentsCount: 0 
        });
    }
};

exports.getSecondYearStudentsForAcademic = async (req, res) => {
    try {
        const studentsData = await Student.find({ year: "II", isDelete: false, isAlumni: false }).lean();

        async function getSubjectNames(examResults) {
            const subjectCodes = examResults.map(result => result.subjectCode);
            const subjects = await subjectCodeModel.find({ subjectCode: { $in: subjectCodes } }).lean();

            const subjectMap = {};
            subjects.forEach(subject => {
                subjectMap[subject.subjectCode] = subject.subjectName;
            });

            return examResults.map(result => ({
                ...result,
                subjectName: subjectMap[result.subjectCode] || "Unknown Subject"
            }));
        }

        async function groupBySemester(examResults) {
            const resultsWithNames = await getSubjectNames(examResults);
            return resultsWithNames.reduce((acc, result) => {
                acc[result.semester] = acc[result.semester] || [];
                acc[result.semester].push(result);
                return acc;
            }, {});
        }

        for (const student of studentsData) {
            student.groupedExamResults = await groupBySemester(student.examResults || []);
        }

        let studentsCount = studentsData.length;
        res.render("academicStudentList", { 
            studentsData, 
            message: null, 
            error: null, 
            year: "II", 
            studentsCount 
        });
    } catch (error) {
        res.status(500).render("academicStudentList", { students: [], message: null, error: "Error fetching students.", year: "II", studentsCount: 0 });
    }
};

exports.getStudentResults = async (req, res) => {
  let year;
    try {
        const student = await studentModel.findById(req.params.studentId);
        year = student.year;
        if (!student) {
            return res.status(404).render("academicResults", { student: null, message: null, error: "Student not found." });
        }
        const backUrl = `/v1/api/getAcademicStudentsList?course=${encodeURIComponent(student.course)}&year=${encodeURIComponent(student.year)}`;
        res.render("academicResults", { student, message: null, error: null, year: year, backUrl });
    } catch (error) {
      console.log(error);
      res.status(500).render("academicResults", { student: null, message: null, error: "Error fetching results.", year: year });
    }
};

exports.addExamResult = async (req, res) => {
    try {
        const { studentId, semester, subjectCode, subjectName, grade, result } = req.body;
        await studentModel.findByIdAndUpdate(studentId, {
            $push: { examResults: { _id: new mongoose.Types.ObjectId(), semester, subjectCode, subjectName, grade, result } }
        });
        res.json({ success: true, message: "Exam result added successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add exam result." });
    }
};

exports.updateExamResult = async (req, res) => {
    try {
        const { studentId, resultId, semester, subjectCode, grade, result } = req.body;
        await studentModel.updateOne(
            { _id: studentId, "examResults._id": resultId },
            { $set: { "examResults.$.semester": semester, "examResults.$.subjectCode": subjectCode, "examResults.$.grade": grade, "examResults.$.result": result } }
        );
        res.json({ success: true, message: "Exam result updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update exam result." });
    }
};

exports.getSubjectCodes = async (req, res) => {
    try {
        const subjects = await subjectCodeModel.find({}, 'subjectCode subjectName').lean();
        res.json({ success: true, subjects });
    } catch (err) {
        console.error("Error fetching subjects:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getJobsData = async (req, res) => {
  try {
    let { title, location, page } = req.query;

    const apiUrl = `https://api.adzuna.com/v1/api/jobs/in/search/${page}`;

    const params = {
      app_id: process.env.ADZUNA_APP_ID,
      app_key: process.env.ADZUNA_APP_KEY,
      results_per_page: 50,
      what: title,
      where: location,
    };

    const response = await axios.get(apiUrl, { params });
    res.json(response.data.results);
  } catch (err) {
    console.log(err);
    res.json([]);
  }
};

exports.renderJobPage = async (req, res) => {
  try {
    res.render("getJobs");
  } catch (err) {
    console.log(err);
    return res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.getStudentDetails = async (req, res) => {
  const accessToken = req.cookies["access-token-student"];
  try {
    const decodedToken = await verify(
      accessToken,
      "mnbvcxzlkjhgfdsapoiuytrewq"
    );
    const studentId = decodedToken.studentId;

    const student = await Student.findOne({ studentId, isAlumni: false, isDelete: false });

    let studyMaterial;
    if (student) {
      // subject = await Subject.find({ year: student.year, isDelete: false });
      studyMaterial = await studyMaterialModel.find({ course: student.course, year: student.year, isDelete: false })
    }

    if (!student) {
      return res.redirect("/v1/api/sessionExpired");
    }

    const attendanceCounts = await AttendanceModel.aggregate([
      { $match: { studentId: student._id } },
      { $group: {
          _id: "$status",
          count: { $sum: 1 }
      } }
    ]);

    let attendanceSummary = { present: 0, absent: 0, late: 0, excused: 0 };
    attendanceCounts.forEach(item => {
      attendanceSummary[item._id] = item.count;
    });

    res.render("studentProfile", { student, studyMaterial, attendanceSummary });
  } catch (err) {
    console.log("Error in getStudentDetails: " + err);
    res.status(500).render('error', { message: "Internal Server Error. Please try again later" });
  }
};

exports.getAlumniStudentDetails = async (req, res) => {
  const accessToken = req.cookies["access-token-alumni"];
  try {
    const decodedToken = await verify(
      accessToken,
      "mnbvcxzlkjhgfdsapoiuytrewq"
    );
    const studentId = decodedToken.studentId;

    const alumni = await Student.findOne({ studentId, isAlumni: true, isDelete: false });

    if (!alumni) {
      return res.redirect("/v1/api/sessionExpired");
    }

    res.render("alumniProfile", { alumni });
  } catch (err) {
    console.log("Error in getAlumniStudentDetails: " + err);
    res.status(500).render('error', { message: "Internal Server Error. Please try again later" });
  }
};

exports.saveAchievement = async (req, res) => {
  let { userId, isEdit, isDelete, achievementId, title, description, year } = req.body;

  try {
    let studentData = await Student.findById(userId);

    if (!studentData) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (isEdit && achievementId) {
      let achievement = studentData.achievements.id(achievementId);
      if (achievement) {
        achievement.title = title;
        achievement.description = description;
        achievement.year = year;
      }
    } else if (isDelete && achievementId) {
      studentData.achievements = studentData.achievements.filter(
        (ach) => ach._id.toString() !== achievementId
      );
    } else {
      let achievement = {
        _id: new mongoose.Types.ObjectId(),
        title,
        description,
        year,
      };
      studentData.achievements.push(achievement);
    }

    await studentData.save();

    res.status(200).json({ success: true, message: "Achievement saved successfully!" });
  } catch (err) {
    console.error("Error in saveAchievement:", err);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

exports.saveSkills = async (req, res) => {
  let { userId, isEdit, isNew, skills } = req.body;

  try {
    let studentData = await Student.findById(userId);

    if (!studentData) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (isEdit) {
      studentData.skills = skills;
    } else if (isNew) {
      skills.forEach(skill => {
        if (!studentData.skills.includes(skill)) {
          studentData.skills.push(skill);
        }
      });
    } else {

    }

    await studentData.save();

    res.status(200).json({ success: true, message: "Skills saved successfully!" });
  } catch (err) {
    console.error("Error in saveSkills:", err);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

exports.saveExperience = async (req, res) => {
  let { userId, isEdit, isDelete, experienceId, title, company, location, startDate, endDate, currentlyWorking, description, skills } = req.body;

  try {
    let studentData = await Student.findById(userId);

    if (!studentData) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (isEdit && experienceId) {
      let experience = studentData.experiences.id(experienceId);
      if (experience) {
        experience.title = title;
        experience.company = company;
        experience.location = location;
        experience.startDate = startDate;
        experience.endDate = endDate;
        experience.currentlyWorking = currentlyWorking;
        experience.description = description;
        experience.skills = skills;
      }
    } else if (isDelete && experienceId) {
      studentData.experiences = studentData.experiences.filter(
        (exp) => exp._id.toString() !== experienceId
      );
    } else {
      let experience = {
        _id: new mongoose.Types.ObjectId(),
        title,
        company,
        location,
        startDate,
        endDate,
        currentlyWorking,
        description,
        skills,
      };
      studentData.experiences.push(experience);
    }

    await studentData.save();

    res.status(200).json({ success: true, message: "Experience saved successfully!" });
  } catch (err) {
    console.error("Error in saveExperience:", err);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

exports.saveEducation = async (req, res) => {
  let { userId, isEdit, isDelete, educationId, degree, institution, location, startYear, endYear, description } = req.body;

  try {
    let studentData = await Student.findById(userId);

    if (!studentData) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (isEdit && educationId) {
      let experience = studentData.education.id(educationId);
      if (experience) {
        experience.degree = degree;
        experience.institution = institution;
        experience.location = location;
        experience.startYear = startYear;
        experience.endYear = endYear;
        experience.description = description;
      }
    } else if (isDelete && educationId) {
      studentData.education = studentData.education.filter(
        (exp) => exp._id.toString() !== educationId
      );
    } else {
      let experience = {
        _id: new mongoose.Types.ObjectId(),
        degree,
        institution,
        location,
        startYear,
        endYear,
        description,
      };
      studentData.education.push(experience);
    }

    await studentData.save();

    res.status(200).json({ success: true, message: "Experience saved successfully!" });
  } catch (err) {
    console.error("Error in saveExperience:", err);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

exports.getExperience = async (req, res) => {
  try {
    let expId = req.params.expId;
    let studentId = req.student._id;
    let student = await Student.findById(studentId);
    let experience = student.experiences.id(expId);
    if (!experience) {
      return res.status(404).json({ success: false, message: "Experience not found!" });
    }
    res.status(200).json({ success: true, experience });
  } catch (err) {
    console.log("Error in getExperience: " + err);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

exports.getEducation = async (req, res) => {
  try {
    let expId = req.params.eduId;
    let studentId = req.student._id;
    let student = await Student.findById(studentId);
    let education = student.education.id(expId);
    if (!education) {
      return res.status(404).json({ success: false, message: "Education not found!" });
    }
    res.status(200).json({ success: true, education });
  } catch (err) {
    console.log("Error in getEducation: " + err);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

exports.alumniNetwork = async (req, res) => {
  try {
    res.render("alumniNetwork", { alumni: true });
  } catch (err) {
    console.log("Error in alumniNetwork: " + err);
    res.status(500).render('error', { message: "Internal Server Error. Please try again later" });
  }
};

module.exports = exports;

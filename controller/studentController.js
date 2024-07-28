const Student = require("../models/studentModel");
const TemplateModel = require("../models/templateModel");
const authFile = require("../middleware/auth");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const pdf = require("html-pdf");
const moment = require("moment");
const countModel = require("../models/countModel")

exports.newStudent = async (req, res) => {
  const body = req.body;
  body.dob = moment(body.dob).format('DD-MM-YYYY');

  const existingStudent = await Student.findOne({
    registerNumber: body.registerNumber, isDelete: false
  });
  if (existingStudent) {
    return res.send(
      '<script>alert("Registration number already exists!"); window.location="/ssm/mca/register";</script>'
    );
  }
  const existingEmail = await Student.findOne({
    email: body.email, isDelete: false
  });
  if (existingEmail) {
    return res.send(
      '<script>alert("Email already exists!"); window.location="/ssm/mca/register";</script>'
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

  student.examTotalFee = "0";
  student.examPendingFee = "0";
  student.examPaymentStatus = "Pending";
  student.examDueDate = "";

  let studentCount = await countModel.findOne({name: "studentCount"})
  let count = studentCount.count;
  let date = Date.now()
  let prefix = moment(date).format("YY")
  let center = "MCA";
  let totalCount = count + 1; // Math.floor(Math.random() * 10000);
  let studentId = `${prefix}${center}${totalCount}`;

  await countModel.findByIdAndUpdate(studentCount._id.toString(),{ 
    $set: { count: totalCount },
  });

  student.studentId = studentId.toString();

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
    return res.send(
      '<script>alert("Registration Failed! - Internal Server Error"); window.location.href = "/ssm/mca/register";</script>'
    );
  }
};

exports.login = async (req, res) => {
  const { studentId, password } = req.body;

  try {
    const student = await Student.findOne({ 
      studentId,
      isDelete: false,
      isAlumni: false
  });

    if (!student) {
      return res.send(
        '<script>alert("Student not Found!"); window.location.href = "/ssm/mca/signin";</script>'
      );
    }
    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      return res.send(
        '<script>alert("Wrong Password!"); window.location.href = "/ssm/mca/signin";</script>'
      );
    }
    const accessToken = await authFile.sToken(student);
    res.cookie("access-token-student", accessToken, {
      maxAge: 60 * 60 * 1000,
    });

    res.redirect("/studentHome");
  } catch (err) {
    console.error("Error logging in:", err);
    return res.send(
      '<script>alert("Login Failed! - Internal Server Error"); window.location.href = "/ssm/mca/signin";</script>'
    );
  }
};

exports.studentForgotPassword = async (req, res) => {
  let body = req.body;
  try {
    let studentId = body.registerNumber;
    let studentData = await Student.findOne({ studentId: studentId, isDelete: false, isAlumni: false });
    if (!studentData) {
      return res.send(
        '<script>alert("student not found! - please check your register number"); window.location.href = "/ssm/mca/student/forgotPassword";</script>'
      );
    }

    let OTP = Math.floor(100000 + Math.random() * 900000);

    console.log(OTP);

    let OTPString = OTP.toString();

    studentData.forgotOtp = OTPString;
    await studentData.save();

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
        return res.send(
          '<script>alert("Error sending OTP"); window.location.href = "/ssm/mca/signin";</script>'
        );
      }
      console.log("OTP sent successfully");
    });

    res.render("studentForgotOtp", { studentData });
  } catch (err) {
    return res.send(
      '<script>alert("forgot password Failed! - Internal Server Error"); window.location.href = "/ssm/mca/student/forgotPassword";</script>'
    );
  }
};

exports.studentForgotOtp = async (req, res) => {
  let { otp, dob } = req.body;
  try {
    let student = await Student.findOne({ forgotOtp: otp });

    if (!student) {
      console.log("Incorrect OTP");
      return res.send('<script>alert("Incorrect OTP or OTP Expired!"); window.location.href = "/ssm/mca/student/forgotPassword";</script>');
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
              <button type="button" onclick="redirect()">Login</button>
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

  } catch (err) {
    return res.send(
      '<script>alert("forgot password Failed! - Internal Server Error"); window.location.href = "/ssm/mca/register";</script>'
    );
  }
}

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

exports.moveStudents = async (req, res) => {
  const selectedYear = req.body.year;
  const graduationYear = req.body.graduationYear;
  const type = req.body.type;
  try {
    if (type === "alumni"){
      const query = { year: selectedYear };
      const result = await Student.updateMany(query, { 
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
          password: null
        } 
      });
      res.redirect("/ssm/mca/alumniList");
    } else {
      const query = { year: selectedYear };
      const result = await Student.updateMany(query, { $set: { year: type } });
      res.redirect("/ssm/mca/studentList");
    }
    
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.updateStudent = async (req, res) => {
  try {
    let body = req.body;
    let userId = req.params.userId;
    body.dob = moment(body.dob).format("DD-MM-YYYY")
    let password = body.dob;


    let saltRounds = 12;
    let hashedPassword = await bcrypt.hash(password, saltRounds);

    await Student.findByIdAndUpdate(userId, {
      name: body.name,
      studentId: body.studentId,
      registerNumber: body.registerNumber,
      gender: body.gender,
      password: hashedPassword,
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

exports.sendAddressUpdateReq = async (req, res) => {
  let data = req.body;
  let selectedYear = data.year;
  let registerNumber = data.registerNumber;

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
    if (registerNumber) {
      let query = { registerNumber: registerNumber };
      const result = await Student.findOneAndUpdate(query, {
        $set: {
          addressUpdate: false,
        },
      });

      if (!result) {
        return res.status(404).send(`
          <script>
            alert("Student not found");
            window.location.href = "/ssm/mca/addressUpdateReq";
          </script>
        `);
      }

      sendMail(result.email, result.name);
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
            window.location.href = "/ssm/mca/addressUpdateReq";
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
          window.location.href = "/ssm/mca/addressUpdateReq";
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
            <p>Address Update Request Sent!</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/addressUpdateReq";
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
        window.location.href = "/ssm/mca/studentList";
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
            <p>Address Updated Successfully!</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/studentProfile";
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
  let { newName, newEmail, registerNumber, newDob, newPhone } = req.body;
  newDob = moment(newDob).format("DD-MM-YYYY")

  try {
      let studentData = await Student.findOneAndUpdate(
          { registerNumber: registerNumber },
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

      if (studentData) {
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
                <p>Profile Update Request Sent</p>
                <div class="button-container">
                  <button type="button" onclick="redirect()">Continue</button>
                </div>
              </div>
            </div>
          
            <script>
              function redirect() {
                window.location.href = "/ssm/mca/studentProfile";
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
      } else {
        return res.send(
          '<script>alert("Error in profile update request!"); window.location="/ssm/mca/studentProfile";</script>'
        );
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error in Profile Update Request' });
  }
};

exports.requestChangeTu = async (req, res) => {
  let { newTuPending, registerNumber, newTuStatus } = req.body;

  try {
      let studentData = await Student.findOneAndUpdate(
          { registerNumber: registerNumber },
          {
              $set: {
                  tuEditRequest: {
                      newTuPending,
                      newTuStatus,
                      status: 'requested'
                  }
              }
          },
          { new: true }
      );

      if (studentData) {
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
                <p>Profile Update Request Sent</p>
                <div class="button-container">
                  <button type="button" onclick="redirect()">Continue</button>
                </div>
              </div>
            </div>
          
            <script>
              function redirect() {
                window.location.href = "/ssm/mca/studentProfile";
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
      } else {
        return res.send(
          '<script>alert("Error in tuition fees update request!"); window.location="/ssm/mca/studentProfile";</script>'
        );
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error in Tuition Update Request' });
  }
};

exports.requestChangeEx = async (req, res) => {
  let { newExPending, newExStatus, registerNumber } = req.body;

  try {
      let studentData = await Student.findOneAndUpdate(
          { registerNumber: registerNumber },
          {
              $set: {
                  exEditRequest: {
                      newExPending,
                      newExStatus,
                      status: 'requested'
                  }
              }
          },
          { new: true }
      );

      if (studentData) {
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
                <p>Profile Update Request Sent</p>
                <div class="button-container">
                  <button type="button" onclick="redirect()">Continue</button>
                </div>
              </div>
            </div>
          
            <script>
              function redirect() {
                window.location.href = "/ssm/mca/studentProfile";
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
      } else {
        return res.send(
          '<script>alert("Error in exam fees update request!"); window.location="/ssm/mca/studentProfile";</script>'
        );
      }
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

    return res.redirect('/ssm/mca/reviewRequest')

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.approveAndRejectTu = async (req, res) => {
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

      if (student.tuEditRequest && student.tuEditRequest.status === 'requested') {
          student.pendingFee = student.tuEditRequest.newTuPending;
          student.paymentStatus = student.tuEditRequest.newTuStatus;
          student.tuEditRequest = null;
          await student.save();
        };
        statusRes = "Approved";
    } else if (status === "Rejected"){
      student = await Student.findOne({registerNumber: registerNumber});

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

    return res.redirect('/ssm/mca/reviewRequestTu')

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.approveAndRejectEx = async (req, res) => {
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

      if (student.exEditRequest && student.exEditRequest.status === 'requested') {
        student.examPendingFee = student.exEditRequest.newExPending;
        student.examPaymentStatus = student.exEditRequest.newExStatus;
        student.exEditRequest = null;
        await student.save();
        };
        statusRes = "Approved";
    } else if (status === "Rejected"){
      student = await Student.findOne({registerNumber: registerNumber});

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

    return res.redirect('/ssm/mca/reviewRequestEx')

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
      Student.find({ isDelete: false, isAlumni: false, year: data.year, paymentStatus: "Pending" }).countDocuments(),
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
      dueDate: studentsData[0].tutionDueDate
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
      Student.find({ isDelete: false, isAlumni: false, year: data.year, examPaymentStatus: "Pending" }).countDocuments(),
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
      dueDate: studentsData[0].examDueDate
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

module.exports = exports;

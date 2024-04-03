const express = require("express");
const nodemailer = require("nodemailer");
const Student = require("../models/studentModel");

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
      setTimeout(() => {
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
    }, i * 500); 
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.error("Error:", err.message);
  }
};

exports.sendEmailByRegNum = async (req, res) => {
  try {
    const { registerNumber, title, subject, message } = req.body;

    const student = await Student.findOne({ registerNumber });

    if (!student) {
      return res.send(
        '<script>alert("Student not Found!"); window.location.href = "/ssm/mca/announcement";</script>'
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const emailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
  <style>
    /* Font and text styling */
    body {
      font-family: 'Poppins', 'Arial', sans-serif;
      line-height: 1.6;
      color: #1a1a1a; /* Dark text color */
      font-size: 16px;
      background-color: #f4f4f4; /* Light gray background */
      margin: 0; /* Remove default body margin */
    }

    h1 {
      font-size: 28px; /* Larger heading size */
      margin-bottom: 15px;
      color: #ff9900; /* Orange heading color */
      text-align: center;
    }

    p {
      margin-bottom: 15px;
      color: #1a1a1a; /* Dark text color */
    }

    /* Structure and layout */
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff; /* White background */
      padding: 30px;
      border-radius: 8px; /* Rounded corners */
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Light shadow for depth */
    }

    /* Footer section styling */
    .footer {
      margin-top: 20px;
      font-size: 12px;
      color: #777777; /* Lighter text color in the footer */
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
  <p>Dear ${student.name},</p>
  <h1>${title}</h1>
    <p>${message}</p> 
    <p>Have a Great Day 😊...</p>
    <p>If you have any questions or need further assistance, please feel free to <a href="mailto:verifyuserofficial@gmail.com" style="color: #007bff; text-decoration: none;">contact us</a>.</p>
    <p>Best regards,<br>Saran Kumar.</p>
    <div class="footer">
      This is an automated message. Please do not reply to this email.
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: "verifyuserofficial@gmail.com",
      to: student.email,
      subject: subject,
      html: emailContent,
    });

    console.log("Email sent successfully");
    // res.redirect("/ssm/mca/announcement");
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
            <p>Announcement Sent Succesfully</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/announcement";
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
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.commonMail = async (req, res) => {
  try {
    const { title, subject, message, year } = req.body;
    let students = [];
    
    if (year === "first") {
      students = await Student.find({ year: "I" }, "email");
    } else if (year === "second") {
      students = await Student.find({ year: "II" }, "email");
    } else if (year === "all") {
      students = await Student.find({}, "email");
    } else {
      return res.send(
        '<script>alert("Invalid Year Selection"); window.location.href = "/ssm/mca/commonAnnouncement";</script>'
      );
    }

    if (!students.length) {
      console.log("No students found.");
      return res.send(
        '<script>alert("Wrong Password!"); window.location.href = "/ssm/mca/commonAnnouncement";</script>'
      );
    }

    const studentEmails = students.map((user) => user.email);
    console.log("Student emails:", studentEmails);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      subject: subject,
    };

    for (let i = 0; i < studentEmails.length; i++) {
      setTimeout(() => {
      mailOptions.to = studentEmails[i];
      mailOptions.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <title>${title}</title>
        <style>/* Font and text styling */
        body {
          font-family: 'Poppins', 'Arial', sans-serif;
          line-height: 1.6;
          color: #1a1a1a; /* Dark text color */
          font-size: 16px;
          background-color: #f4f4f4; /* Light gray background */
          margin: 0; /* Remove default body margin */
        }
    
        h1 {
          font-size: 28px; /* Larger heading size */
          margin-bottom: 15px;
          color: #ff9900; /* Orange heading color */
          text-align: center;
        }
    
        p {
          margin-bottom: 15px;
          color: #1a1a1a; /* Dark text color */
        }
    
        /* Structure and layout */
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff; /* White background */
          padding: 30px;
          border-radius: 8px; /* Rounded corners */
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Light shadow for depth */
        }
    
        /* Footer section styling */
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #777777; /* Lighter text color in the footer */
          text-align: center;
        }</style>
        </head>
        <body>
        <div class="container">
        <p>Dear Students,</p>
        <h1>${title}</h1>
    <p>${message}</p> 
    <p>Have a Great Day 😊...</p>
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
    }, i * 500); 
  }

    // res.redirect("/ssm/mca/commonAnnouncement");
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
            <p>Announcement Sent Succesfully</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/commonAnnouncement";
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
    res.status(500).json({ message: err.message });
    console.error("Error:", err.message);
  }
};

/* exports.sendPaymentAlert = async (req, res) => {
  try {
    const { year, type } = req.body;

    if (!year || !type) {
      return res.send(
        '<script>alert("Select Options Correctly"); window.location.href = "/ssm/mca/paymentAlert";</script>'
      );
    }

    let students;
    if (type === "Tuition") {
      if (year === "I") {
        students = await Student.find({ year: "I", paymentStatus: "Pending" }, "name email");
      } else if (year === "II") {
        students = await Student.find({ year: "II", paymentStatus: "Pending" }, "name email");
      } else {
        return res.send(
          '<script>alert("Invalid Year"); window.location.href = "/ssm/mca/paymentAlert";</script>'
        );
      }
    } else if (type === "Exam") {
      if (year === "I") {
        students = await Student.find({ year: "I", examPaymentStatus: "Pending" }, "name email");
      } else if (year === "II") {
        students = await Student.find({ year: "II", examPaymentStatus: "Pending" }, "name email");
      } else {
        return res.send(
          '<script>alert("Invalid Year"); window.location.href = "/ssm/mca/paymentAlert";</script>'
        );
      }
    } else {
      return res.send(
        '<script>alert("Select Type"); window.location.href = "/ssm/mca/paymentAlert";</script>'
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      subject: `${type} Fee Payment Reminder ⏰.`,
    };

    for (let i = 0; i < students.length; i++) {
      mailOptions.to = students[i].email;
      mailOptions.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tuition Fee Payment Reminder</title>
      <style>
        body, h1, p, a {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
        }
        body {
          background-color: #f4f4f4;
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
          margin-bottom: 20px;
        }
        p {
        margin-bottom: 15px;
        text-align: justify;
      }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #777777;
          text-align: center;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
      </style>
      </head>
      <body>
      <div class="container">
        <h1>${type} Fee Payment Reminder ⏰</h1>
        <p>Dear ${students[i].name},</p>
        <p>This is a reminder that your ${type} fee payment is pending. Please complete the payment at your earliest convenience to avoid any late fees or penalties.</p>
        <p>If you have already made the payment, please disregard this message.</p>
        <p>If you have any questions or need assistance, please <a href="mailto:verifyuserofficial@gmail.com">Contact</a> us.</p>
        <p>Best regards,<br>SSM COLLEGE OF ENGINEERING</p>
        <div class="footer">
          This is an automated message. Please do not reply to this email.
        </div>
      </div>
      </body>
      </html>
      
      `;
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(`Error sending email to ${students[i].email}:`, err);
        } else {
          console.log(`Email sent successfully to ${students[i].email}.`);
        }
      });
    }
  //  res.send('<script>alert(`Alert Sent to ${year} Year ${type} Fees Pending Students`); window.location.href = "/ssm/mca/paymentAlert";</script>');
    res.redirect('/ssm/mca/paymentAlert')
  } catch (err) {
    return res.send(
      '<script>alert("Error in Payment Alert"); window.location.href = "/ssm/mca/paymentAlert";</script>'
    );
    console.error("Error:", err.message);
  }
}; */

exports.sendPaymentAlert = async (req, res) => {
  try {
    const { year, type } = req.body;

    if (!year || !type) {
      return res.send(
        '<script>alert("Select Options Correctly"); window.location.href = "/ssm/mca/paymentAlert";</script>'
      );
    }

    let students;
    let dueDate;
    let pendingFee;
    if (type === "Tuition") {
      if (year === "I") {
        students = await Student.find({ year: "I", paymentStatus: "Pending", isDelete: false }, "name email tutionDueDate pendingFee");
      } else if (year === "II") {
        students = await Student.find({ year: "II", paymentStatus: "Pending", isDelete: false }, "name email tutionDueDate pendingFee");
      } else {
        return res.send(
          '<script>alert("Invalid Year"); window.location.href = "/ssm/mca/paymentAlert";</script>'
        );
      }
    } else if (type === "Exam") {
      if (year === "I") {
        students = await Student.find({ year: "I", examPaymentStatus: "Pending", isDelete: false }, "name email examDueDate examPendingFee");
      } else if (year === "II") {
        students = await Student.find({ year: "II", examPaymentStatus: "Pending", isDelete: false }, "name email examDueDate examPendingFee");
      } else {
        return res.send(
          '<script>alert("Invalid Year"); window.location.href = "/ssm/mca/paymentAlert";</script>'
        );
      }
    } else {
      return res.send(
        '<script>alert("Select Type"); window.location.href = "/ssm/mca/paymentAlert";</script>'
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen",
      },
    });

    const mailOptions = {
      from: "verifyuserofficial@gmail.com",
      subject: `${type} Fee Payment Reminder ⏰.`,
    };

    for (let i = 0; i < students.length; i++) {
      setTimeout(() => {
        mailOptions.to = students[i].email;
        mailOptions.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${type} Fee Payment Reminder</title>
        <style>
          body, h1, p, a {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          body {
            background-color: #f4f4f4;
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
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 15px;
            text-align: justify;
          }
          .highlight {
            font-weight: bold;
            color: #ff0000; /* Red color */
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777777;
            text-align: center;
          }
          a {
            color: #007bff;
            text-decoration: none;
          }
        </style>
        </head>
        <body>
        <div class="container">
          <h1>${type} Fee Payment Reminder ⏰</h1>
          <p>Dear ${students[i].name},</p>
          <p>This is a reminder that your ${type} fee payment is pending. The due date for the payment is <span class="highlight">
          ${type === "Tuition" ? (students[i].tutionDueDate) : (students[i].examDueDate)}</span>. 
          Your pending fee is <span class="highlight"> Rs. ${type === "Tuition" ? (students[i].pendingFee) : (students[i].examPendingFee)}</span>.
           Please complete the payment at your earliest convenience to avoid any late fees or penalties.</p>
          <p>If you have already made the payment, please disregard this message.</p>
          <p>If you have any questions or need assistance, please <a href="mailto:verifyuserofficial@gmail.com">contact us</a>.</p>
          <p>Best regards,<br>Sarankumar</p>
          <div class="footer">
            This is an automated message. Please do not reply to this email.
          </div>
        </div>
        </body>
        </html>
        
        `;
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(`Error sending email to ${students[i].email}:`, err);
          } else {
            console.log(`Email sent successfully to ${students[i].email}.`);
          }
        });
      }, i * 500); 
    }
    //  res.send('<script>alert(`Alert Sent to ${year} Year ${type} Fees Pending Students`); window.location.href = "/ssm/mca/paymentAlert";</script>');
    // res.redirect('/ssm/mca/paymentAlert')
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
            <p>Payment Alert Sent Succesfully</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/paymentAlert";
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
    console.log(err, err.message);
    return res.send(
      '<script>alert("Error in Payment Alert"); window.location.href = "/ssm/mca/paymentAlert";</script>'
    );
  }
};

module.exports = exports;

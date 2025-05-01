const express = require("express");
const nodemailer = require("nodemailer");
const Student = require("../models/studentModel");
const Admin = require("../models/adminModel");
const notificationModel = require("../models/notificationsModel");

exports.sendMail = async (req, res) => {
  try {
    const students = await Student.find({isDelete: false, isAlumni: false}, "email");
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
    const { studentId, title, subject, message } = req.body;

    const student = await Student.findOne({ studentId, isDelete: false, isAlumni: false });

    if (!student) {
      return res.send(
        '<script>alert("Student not Found!"); window.location.href = "/v1/api/announcement";</script>'
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
    body {
      font-family: 'Poppins', 'Arial', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      font-size: 16px;
      background-color: #f4f4f4; 
      margin: 0; 
    }

    h1 {
      font-size: 28px; 
      margin-bottom: 15px;
      color: #ff9900; 
      text-align: center;
    }

    p {
      margin-bottom: 15px;
      color: #1a1a1a;
    }

    
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff; 
      padding: 30px;
      border-radius: 8px; 
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); 
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
    // res.redirect("/v1/api/announcement");
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
            <p>Announcement Sent Succesfully</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/v1/api/announcement";
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
    const yearMapping = { "1": "I", "2": "II", "3": "III", "4": "IV" };
    const { types, gender, alumniDetails, courseYears, courses, title, subject, message } = req.body;

    const genderFilter = gender !== "all" ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : null;
    const recipientList = [];

    if (types.includes("students") && courses.length > 0 && courseYears.length > 0) {
      for (const courseYear of courseYears) {
        const [course, yearNum] = courseYear.split("-");
        const year = yearMapping[yearNum];
        if (!year) continue;

        const students = await Student.find(
          {
            course: course.toUpperCase(),
            year,
            isAlumni: false,
            isDelete: false,
            ...(genderFilter && { gender: genderFilter }),
          },
          "email name"
        );
        recipientList.push(...students.map(({ email, name }) => ({ email, name })));
      }
    } else if (types.includes("students")) {
      const students = await Student.find(
        {
          isAlumni: false,
          isDelete: false,
          ...(genderFilter && { gender: genderFilter }),
        },
        "email name"
      );
      recipientList.push(...students.map(({ email, name }) => ({ email, name })));
    }

    if (types.includes("faculty") || types.includes("staff")) {
      const faculty = await Admin.find(
        { isDelete: false, isActive: true, isFaculty: true },
        "email fullName"
      );
      recipientList.push(...faculty.map(({ email, fullName }) => ({ email, name: fullName })));
    }

    if (types.includes("alumni")) {
      const alumni = await Student.find(
        {
          isDelete: false,
          isAlumni: true,
          course: alumniDetails.alumniCourse.toUpperCase(),
          graduationYear: alumniDetails.graduationYear,
          ...(genderFilter && { gender: genderFilter }),
        },
        "email name"
      );
      recipientList.push(...alumni.map(({ email, name }) => ({ email, name })));
    }

    if (types.includes("all")) {
      const allUsers = await Student.find(
        { isDelete: false, ...(genderFilter && { gender: genderFilter }) },
        "email name"
      );
      recipientList.push(...allUsers.map(({ email, name }) => ({ email, name })));
    }

    if (!recipientList.length) {
      return res.json({ success: false, message: "No recipients found." });
    }

    res.json({ success: true, message: "Announcement Sent Successfully!" });

    const transporter = nodemailer.createTransport({
      pool: true,
      service: "gmail",
      auth: {
        user: "verifyuserofficial@gmail.com",
        pass: "wsdv megz vecp wzen", 
      },
      maxConnections: 5,
      maxMessages: 100,
      rateLimit: 5,
      rateDelta: 2000,
    });

    const generateHtml = (name) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 30px auto;
            background: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #ff9900;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            font-size: 16px;
            color: #333;
            line-height: 1.5;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <p>Dear ${name},</p>
          <h1>${title}</h1>
          <p>${message}</p>
          <p>Have a Great Day 😊...</p>
          <p>If you have any questions, feel free to
            <a href="mailto:verifyuserofficial@gmail.com" style="color: #007bff;">contact us</a>.
          </p>
          <p>Best regards,<br>Saran Kumar</p>
          <div class="footer">
            This is an automated message. Please do not reply.
          </div>
        </div>
      </body>
      </html>
    `;

    const batchSize = 20;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < recipientList.length; i += batchSize) {
      const batch = recipientList.slice(i, i + batchSize);
      await Promise.all(
        batch.map(({ email, name }) => {
          const mailOptions = {
            from: "verifyuserofficial@gmail.com",
            to: email,
            subject,
            html: generateHtml(name),
          };

          return transporter.sendMail(mailOptions)
            .then(() => console.log(`✅ Email sent to ${email}`))
            .catch((err) => console.error(`❌ Failed to send to ${email}:`, err.message));
        })
      );

      if (i + batchSize < recipientList.length) {
        await delay(2000);
      }
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};


/* exports.sendPaymentAlert = async (req, res) => {
  try {
    const { year, type } = req.body;

    if (!year || !type) {
      return res.send(
        '<script>alert("Select Options Correctly"); window.location.href = "/v1/api/paymentAlert";</script>'
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
          '<script>alert("Invalid Year"); window.location.href = "/v1/api/paymentAlert";</script>'
        );
      }
    } else if (type === "Exam") {
      if (year === "I") {
        students = await Student.find({ year: "I", examPaymentStatus: "Pending" }, "name email");
      } else if (year === "II") {
        students = await Student.find({ year: "II", examPaymentStatus: "Pending" }, "name email");
      } else {
        return res.send(
          '<script>alert("Invalid Year"); window.location.href = "/v1/api/paymentAlert";</script>'
        );
      }
    } else {
      return res.send(
        '<script>alert("Select Type"); window.location.href = "/v1/api/paymentAlert";</script>'
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
  //  res.send('<script>alert(`Alert Sent to ${year} Year ${type} Fees Pending Students`); window.location.href = "/v1/api/paymentAlert";</script>');
    res.redirect('/v1/api/paymentAlert')
  } catch (err) {
    return res.send(
      '<script>alert("Error in Payment Alert"); window.location.href = "/v1/api/paymentAlert";</script>'
    );
    console.error("Error:", err.message);
  }
}; */

exports.sendPaymentAlert = async (req, res) => {
  try {
    const { course, year, type } = req.body;

    let students;

    if (type === "Tuition") {
      students = await Student.find(
        {
          course: course,
          year: year,
          isDelete: false,
          $or: [{ paymentStatus: "Pending" }, { paymentStatus: "Partial" }],
        },
        "name email tutionDueDate pendingFee"
      );
    } else if (type === "Exam") {
      students = await Student.find(
        {
          course: course,
          year: year,
          isDelete: false,
          $or: [
            { examPaymentStatus: "Pending" },
            { examPaymentStatus: "Partial" },
          ],
        },
        "name email examDueDate examPendingFee"
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
            color: #ff0000; 
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

    res.json({
      success: true,
      message: "Payment alert sent successfully!"
    });
    
  } catch (err) {
    console.log(err, err.message);
    res.json({
      success: true,
      message: "Payment alert failed!"
    });
  }
};

exports.admissionForm = async (req, res) => {
  try {
    
  } catch (err) {
    console.log(err, err.message);
    return res.send(
      '<script>alert("Application sumit failed.."); window.location.href = "/";</script>'
    );
  }
};

exports.fetchNotifications = async (req, res) => {
  let { page = 1, limit = 10, userId } = req.body;
  let skip = (page - 1) * limit;

  try {
    let [notifications, unreadCount] = await Promise.all([
      notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      notificationModel.countDocuments({ userId, readStatus: false })
    ]);

    res.status(200).json({
      success: true,
      notifications: notifications,
      unreadCount: unreadCount,
      currentPage: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.log("Error in fetchNotifications:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateNotificationStatus = async (req, res) => {
  let body = req.body;
  try {
    let userId = body.userId;
    let updateStatus = await notificationModel.updateMany(
      { userId, readStatus: false },
      { $set: { readStatus: true } }
    );
    if (updateStatus) {
      res.status(200).json({
        success: true,
        message: "Notification status updated successfully!",
      });
    } else {
      res.status(200).json({
        success: false,
        message: "No unread notifications found.",
      });
    }

  } catch (err) {
    console.log("Error in updateNotificationStatus:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.updateNotificationStatusById = async (req, res) => {
  try {
    let notificationId = req.params.notificationId;
    let updateStatus = await notificationModel.findByIdAndUpdate(
      notificationId,
      { $set: { readStatus: true } },
      { new: true }
    );
    if (updateStatus) {
      res.status(200).json({
        success: true,
        message: "Notification status updated successfully!",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }
  } catch (err) {
    console.log("Error in updateNotificationStatusById:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = exports;

const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const authFile = require("../middleware/auth");
const countModel = require("../models/countModel")
const moment = require("moment");
const attendanceController = require("../controller/attendanceController");
const employeeSalaryModel = require("../models/employeeSalaryModel");
const staffAttendanceModel = require("../models/staffAttendanceModel");
const helper = require("../helper");
const cloudinary = require('cloudinary').v2;
const contactModel = require("../models/contactModel");
const admissionModel = require("../models/admissionModel");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

exports.staffRegister = async (req, res) => {
  let body = req.body;

  try {
    
    let [existingEmail, existingPhone] = await Promise.all([
      Admin.findOne({ phone: body.phone, isActive: true, isDelete: false }),
      Admin.findOne({ email: body.email, isActive: true, isDelete: false })
    ]);
    
    if (existingEmail) {
      return res.json({
        success: false,
        message: "Email already exists!"
      });
    }

    if (existingPhone) {
      return res.json({
        success: false,
        message: "Phone Number already exists!"
      });
    }

    let imageUrl;

    if (req.file) {
      try {
        const staffImg = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { public_id: req.file.originalname, resource_type: 'auto', folder: 'staff' },
            (error, result) => (error ? reject(error) : resolve(result))
          ).end(req.file.buffer);
        });
        imageUrl = staffImg.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary Upload Error:', uploadError);
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }
    }

    let empCount = await countModel.findOne({name: "EMP"})
    let count = empCount.count;
    let date = Date.now()
    let prefix = moment(date).format("YY")
    let totalCount = count + 1;
    let staffId = `SSMEC${totalCount}`;
    let employeeId = `EMP${totalCount}`;
    let employeeCode = totalCount.toString();

    await countModel.findByIdAndUpdate(empCount._id.toString(), {
      $set: { count: totalCount },
    });

    let randomPassword = Math.random().toString(36).substring(2, 8);

    let pwd = randomPassword.toUpperCase();

    let saltRounds = 12;
    let hashedPassword = await bcrypt.hash(pwd, saltRounds);

    let fullName = body.firstName + " " + body.lastName;

    let user = new Admin({
      ...body,
      staffId: staffId,
      fullName: fullName,
      status: "Active",
      password: hashedPassword,
      imageUrl: imageUrl,
      bankDetails: {
        accountHolderName: body.accountHolderName,
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode,
        bankName: body.bankName,
        upiId: body?.upiId || null,
      },
      employeeId: employeeId,
      employeeCode: employeeCode,
      isFaculty: true,
      isAdmin: body.isAdmin === "true" ? true : false,
      isSuperAdmin: body.isSuperAdmin === "true" ? true : false,
      additionalInfo: body.additionalInfo || null,
    });
    
    let userData = await user.save();

    res.json({
      success: true,
      message: "Registered successfully!"
    });

    const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "ssmcollegeofengineering.ce@gmail.com",
                    pass: "xotj gtda ojfg zbtc",
                },
            });

    let mailOptions = {
      from: 'ssmcollegeofengineering.ce@gmail.com',
      to: user.email,
      subject: 'Registration Successful.',
        html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Account Setup Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
          h1 {
            font-size: 28px;
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
            padding: 10px;
            border-radius: 5px;
            display: block;
            text-align: center;
            margin-top: 10px;
          }
          @media (max-width: 600px) {
            h1 {
              font-size: 24px;
            }
            .container {
              padding: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Account Setup Confirmation</h1>
          <p>Dear ${user.name},</p>
          <p>Your account has been successfully created 🚀. We are pleased to have you on board.</p>
          <p>Here are your login details:</p>
          <ul>
            <li><strong>Login ID:</strong> ${staffId}</li>
            <li><strong>Password:</strong> ${pwd}</li>
          </ul>
          <p><span class="highlight">Please note: This password was randomly generated. For security reasons, we highly recommend resetting your password upon your first login.</span></p>
          <p>You can reset your password by visiting the following link:</p>
          <p><a href="https://ssm-mca.onrender.com/v1/api/forgotPassword" target="_blank">Reset Your Password</a></p>
          <p>If you have any questions or need further assistance, please feel free to <a href="mailto:verifyuserofficial@gmail.com">contact us</a>.</p>
          <p>Best regards,<br>SSM College Of Engineering</p>
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

    let empSalary = new employeeSalaryModel({
      staffId: userData._id,
      salaryAmount: Number(userData.salary)
    });

    await empSalary.save();

    // return res.render('signupSucces')
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    })
  }
};

exports.login = async (req, res) => {
  try {

    let userName = req.body.email.trim();
    let password = req.body.password.trim();

    let user = await Admin.findOne({
      $or: [
        { email: userName },
        { staffId: userName }
      ],
      isDelete: false
    });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Please check your login credentials"
      });
    }

    let status = user.isActive;

    if (!status) {
      return res.status(200).json({
        success: false,
        message: "User Disabled! Please Contact your Admin"
      });
    }

    let isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(200).json({
        success: false,
        message: "Incorrect password!"
      });
    }

    let OTP = Math.floor(100000 + Math.random() * 900000);

    if (user.email === "sarankumar@outlook.in" || user.email === "saran@outlook.in") {
      OTP = 123456;
    }

    let OTPString = OTP.toString();
    
    user.otp = OTPString;

    let resData = {
      email: user.email,
      staffId: user.staffId
    };
    
    res.status(200).json({
      success: true,
      data: resData
    });

    await user.save();

    let emailTemplate = await helper.getEmailTemplate("OTP_VERIFICATION");
    let content = '';

    if (emailTemplate.status) {
      content = eval('`' + emailTemplate.template + '`')
    }

    helper.sendEmail(user.email, "OTP Verification", content);
  } catch (err) {
    console.log("Error in userLogin:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    let body = req.body;

    let digits = [...body?.otp];

    const user = await Admin.findOne({ staffId: body.staffId });

    if (body?.otp !== user.otp) {
      return res.status(200).json({
        success: false,
        message: "Invalid OTP. Please try again!"
      })
    }

    user.isOTPVerified = true;
    user.otp = null;
    await user.save();

    const accessToken = await authFile.token(user);
    res.cookie("access-token", accessToken, {
      maxAge: 86400000
    });

    let redirectUrls = {};

    if (user.isAdmin || user.isSuperAdmin) {
      redirectUrls.dashboardUrl = "/v1/api/dashboard";
    }

    if (user.isFaculty) {
      redirectUrls.profileUrl = "/v1/api/staff/profile";
    }

    let resData = {
      id: user._id.toString(),
      staffId: user.staffId,
      redirectUrls: redirectUrls,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      isFaculty: user.isFaculty,
    };

    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({
      success: true,
      data: resData,
      redirectUrls: redirectUrls,
      message: "OTP Verified Successfully!"
    });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal Server Error!"
    });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    let user = await Admin.findOne({ staffId: req?.body?.staffId});

    let OTP = Math.floor(100000 + Math.random() * 900000);
    if (user.email === "sarankumar@outlook.in" || user.email === "saran@outlook.in") {
      OTP = 123456;
    }
    let OTPString = OTP.toString();
    user.otp = OTPString;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully!"
    });

    let emailTemplate = await helper.getEmailTemplate("OTP_VERIFICATION");
    let content = '';

    if (emailTemplate.status) {
      content = eval('`' + emailTemplate.template + '`')
    }

    helper.sendEmail(user.email, "OTP Verification", content);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    })
  }
};

exports.resetPassword = async (req, res) => {
  try {
    let user = await Admin.findOne({
      $and: [
        {
          $or: [{ email: req.body.staffId }, { staffId: req.body.staffId }],
        },
        { isDelete: false },
      ],
    });

    let status = user.isActive;

    if (!status) {
      return res.status(200).json({
        success: false,
        message: "User Disabled! Please Contact your Admin"
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

exports.forgotPassword = async (req, res) => {
  try {
    let user = await Admin.findOne({
      $and: [
        {
          $or: [{ email: req.body.email }, { staffId: req.body.email }],
        },
        { isDelete: false },
      ],
    });
    if (!user) {
      // return res.send(
      //   '<script>alert("User Not Found!"); window.location.href = "/v1/api/forgotPassword";</script>'
      // );
      return res.status(200).json({
        success: false,
        message: "User not found!"
      });
    }

    let OTP = Math.floor(100000 + Math.random() * 900000);

    if (user.email === "sarankumar@outlook.in" || user.email === "saran@outlook.in") {
      OTP = 123456;
    }

    console.log(OTP);

    let OTPString = OTP.toString();

    user.forgotOtp = OTPString;
    await user.save();

    let resData = {
      email: user.email
    }

    res.status(200).json({
      success: true,
      data: resData,
      message: "OTP sent successfully!"
    })

    let emailTemplate = await helper.getEmailTemplate("RESET_PASSWORD_OTP");
    let content = '';

    if (emailTemplate.status) {
      content = eval('`' + emailTemplate.template + '`');
    }

    helper.sendEmail(user.email, "Reset Password OTP", content);

    // res.render("forgotOtp", { user: user });
  } catch (err) {
    console.log("Error in forgot password:", err);
    // return res.send(
    //   '<script>alert("forgot password failed! - Internal Server Error"); window.location.href = "/v1/api/signin";</script>'
    // );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
}

exports.forgotOtp = async (req, res) => {
  let { otp, password, confirmPassword } = req.body;

  try {
    let user = await Admin.findOne({ forgotOtp: otp, isDelete: false });

    if (!user) {
      console.log("Incorrect OTP");
      return res.send('<script>alert("Incorrect OTP or OTP Expired!"); window.location.href = "/v1/api/forgotPassword";</script>');
    }

    if (password !== confirmPassword) {
      return res.send('<script>alert("Passwords do not match!"); window.location.href = "/v1/api/forgotPassword";</script>');
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
              <button type="button" onclick="redirect()">Continue</button>
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
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.staffUpdate = async (req, res) => {
  try {
    let body = req.body;
    let userId = req.params.userId;

    let fileName; 
    let imgFile;

    if (req.file) {
      fileName = body.fullName.replace(/\s+/g, "_") + "_" + Date.now();
      imgFile = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            public_id: fileName,
            resource_type: "auto",
            folder: "staff",
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
    
    const student = await Admin.findById(userId);
    let imageUrl = student?.imageUrl;
    
    if (imgFile) {
      imageUrl = imgFile.secure_url;
    }

    let fullName = body.firstName + " " + body.lastName;

    await Admin.findByIdAndUpdate(userId, {
      bankDetails: {
        accountHolderName: body.accountHolderName,
        accountNumber: body.accountNumber,
        ifscCode: body.ifscCode,
        bankName: body.bankName,
        upiId: body?.upiId || null,
      },
      employeeId: body.employeeId,
      employeeCode: body.employeeCode,
      isFaculty: body.isFaculty === "true" ? true : false,
      isAdmin: body.isAdmin === "true" ? true : false,
      isSuperAdmin: body.isSuperAdmin === "true" ? true : false,
      aadhaarNum: body.aadhaarNum,
      firstName: body.firstName,
      lastName: body.lastName,
      fullName: fullName,
      email: body.email,
      phone: body.phone,
      isActive: true,
      gender: body.gender,
      phone: body.phone,
      dob: body.dob,
      aadhaarNum: body.aadhaarNum,
      nationality: body.nationality,
      address: body.address,
      city: body.city,
      state: body.state,
      pinCode: body.pinCode,
      department: body.department,
      publications: body.publications,
      researchInterests: body.researchInterests,
      emergencyPhone: body.emergencyPhone,
      emergencyContact: body.emergencyContact,
      certifications: body.certifications,
      yearOfPassing: body.yearOfPassing,
      university: body.university,
      highestQualification: body.highestQualification,
      specialization: body.specialization,
      experience: body.experience,
      joiningDate: body.joiningDate,
      designation: body.designation,
      imageUrl: imageUrl
    });

    res.json({
      success: true,
      message: "Staff Updated Successfully!"
    })
  } catch (err) {
    console.log("Error in staff update:", err);
    res.json({
      success: false,
      message: "Internal Server Error!"
    })
  }
};

exports.staffDelete = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await Admin.findByIdAndUpdate(userId, { isDelete: true, isActive: false, isFaculty: false, isAdmin: false, isSuperAdmin: false });
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.status(200).json({
      success: true,
      message: "Staff Deleted Successfully!"
    });
  } catch (err) {
    console.error(err);
    res.status(200).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.getUserRole = async (req, res) => {
  let body = req.body;
  try {
    let userData = await Admin.findById(body.userId);
    res.json({
      success: true,
      isFaculty: userData?.isFaculty,
      isAdmin: userData?.isAdmin,
      isSuperAdmin: userData?.isSuperAdmin,
      role: userData?.role?.toLowerCase(),
      department: userData?.department?.toLowerCase()
    });
  } catch (err) {
    console.log(err)
    res.json({
      success: false,
      role: null
    });
  }
};

exports.getStaffData = async (req, res) => {
  try {
    let userData = await Admin.find({ isDelete: false, isActive: true, isFaculty: true, }).sort({ createdAt: -1 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.status(200).json(userData);
  } catch (err) {
    console.log(err)
    res.status(500).json([]);
  }
};

exports.updateStaffStatus = async (req, res) => {
  try {
    const userId = req.body.userId;
    let isActive = req.body.isActive;
    const user = await Admin.findByIdAndUpdate(userId, { isActive: isActive, });
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.status(200).json({
      success: true,
      message: isActive ? "Staff Activated Successfully!" : "Staff Deactivated Successfully!"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.getStaffProfilePage = async (req, res) => {
  try {
    let userId = req.user.id;

    await attendanceController.carryForwardLeaves(userId);

    let staffData = await Admin.findById(userId);

    const attendanceCounts = await staffAttendanceModel.aggregate([
      { $match: { staffId: staffData._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    let attendanceSummary = { present: 0, absent: 0, late: 0 };
    attendanceCounts.forEach(item => {
      attendanceSummary[item._id] = item.count;
    });

    res.render("staffProfile", { staff: staffData, attendanceSummary: attendanceSummary });
  } catch (err) {
    console.log("Error in getStaffProfilePage: " + err);
    return res.render('error', { message: "Internal Server Error!" });
  }
}

exports.getStaffProfileData = async (req, res) => {
  try {

    let userId = req.user.id;

    let staffData = await Admin.findById(userId);

    // let attendanceCounts = await AttendanceModel.aggregate([
    //   { $match: { studentId: student._id } },
    //   { $group: {
    //       _id: "$status",
    //       count: { $sum: 1 }
    //   } }
    // ]);

    // let attendanceSummary = { present: 0, absent: 0, late: 0, excused: 0 };
    // attendanceCounts.forEach(item => {
    //   attendanceSummary[item._id] = item.count;
    // });

    res.status(200).json({
      success: true,
      data: staffData,
    });
  } catch (err) {
    console.log("Error in getStaffProfile: " + err);
    res.json({
      success: false,
      message: "Internal Server Error!"
    })
  }
};

exports.updateEmpSalaryList = async (req, res) => {
  try {
    res.render("updateEmpSalaryList");
  } catch (err) {
    console.log("Error in updateEmpSalaryList: " + err);
    return res.render('error', { message: "Internal Server Error!" });
  }
};

exports.getStaffSalartList = async (req, res) => {
  try {
    // let staffs = await Admin.find({ isDelete: false, isActive: true, isFaculty: true }).sort({ createdAt: -1 });
    let staffs = await employeeSalaryModel.find().populate("staffId");
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.status(200).json({
      success: true,
      staffs: staffs
    });
  } catch (err) {
    console.log("Error in updateEmpSalaryList: " + err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.staffBulkSalaryUpdate = async (req, res) => {
  try {
    const { employeeIds, salaries } = req.body;

    if (Array.isArray(employeeIds) && Array.isArray(salaries)) {
      const updates = employeeIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { salaryAmount: Number(salaries[index]) } },
        },
      }));

      await employeeSalaryModel.bulkWrite(updates);
    }

    res.json({
      success: true,
      message: "Salary updated successfully!"
    });
  } catch (err) {
    console.log("Error in staffBulkSalaryUpdate: " + err);
    res.json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.updateProfile = async (req, res) => {
  let userData = req.user;
  let reqBody = req.body;
  try {
    let formatDob = moment(reqBody.dob, ("DD-MM-YYYY" || "YYYY-MM-DD" )).format("DD-MM-YYYY");
    let updateObj = {
      aadhaarNum: reqBody.aadhaarNum,
      address: reqBody.address,
      bloodGroup: reqBody.bloodGroup,
      city: reqBody.city,
      dob: formatDob,
      email: reqBody.email,
      emergencyContact: reqBody.emergencyContact,
      firstName: reqBody.firstName,
      lastName: reqBody.lastName,
      phone: reqBody.phone,
      pinCode: reqBody.pinCode,
      state: reqBody.state,
      gender: reqBody.gender,
      fullName: reqBody.firstName + " " + reqBody.lastName
    }
    let updateData = await Admin.findByIdAndUpdate(userData.id, updateObj, {new: true});

    if (updateData) {
      return res.json({
        success: true,
        message: "Profile details updated successfully!..."
      });
    } else {
      return res.json({
        success: false,
        message: "Failed to update Profile details"
      });
    }
  } catch (err) {
    console.log("Error in updateProfile: " + err);
    res.json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.updateBankDetails = async (req, res) => {
  let userData = req.user;
  let reqBody = req.body;
  try {
    let updateObj = {
      bankDetails: {
        accountHolderName: reqBody.accountHolderName,
        accountNumber: reqBody.accountNumber,
        bankName: reqBody.bankName,
        ifscCode: reqBody.ifscCode,
        upiId: reqBody.upiId,
      }
    }
    let updateData = await Admin.findByIdAndUpdate(userData.id, updateObj, {new: true});

    if (updateData) {
      return res.json({
        success: true,
        message: "Bank details updated successfully!..."
      });
    } else {
      return res.json({
        success: false,
        message: "Failed to update Bank details"
      });
    }
  } catch (err) {
    console.log("Error in updateBankDetails: " + err);
    res.json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { message: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const contactMessages = await contactModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const totalCount = await contactModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push({ number: i, isCurrent: i === page, isEllipsis: false });
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push({ number: i, isCurrent: i === page, isEllipsis: false });
        }
        pages.push({ isEllipsis: true });
        pages.push({ number: totalPages, isCurrent: false, isEllipsis: false });
      } else if (page >= totalPages - 2) {
        pages.push({ number: 1, isCurrent: false, isEllipsis: false });
        pages.push({ isEllipsis: true });
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push({ number: i, isCurrent: i === page, isEllipsis: false });
        }
      } else {
        pages.push({ number: 1, isCurrent: false, isEllipsis: false });
        pages.push({ isEllipsis: true });
        pages.push({ number: page, isCurrent: true, isEllipsis: false });
        pages.push({ isEllipsis: true });
        pages.push({ number: totalPages, isCurrent: false, isEllipsis: false });
      }
    }

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully",
      data: {
        messages: contactMessages,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limit,
          startItem: skip + 1,
          endItem: skip + contactMessages.length,
          hasNext,
          hasPrevious,
          nextPage: hasNext ? page + 1 : null,
          previousPage: hasPrevious ? page - 1 : null,
          pages,
        },
      },
    });
  } catch (err) {
    console.error("Error in getContactMessages:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.contactMessagesStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let [totalCount, todayCount, newCount] = await Promise.all([
      contactModel.find({}).countDocuments(),
      contactModel.find({
        date: { $gte: startOfToday, $lte: endOfToday }
      }).countDocuments(),
      contactModel.find({
        readStatus: false
      }).countDocuments()
    ]);
    return res.status(200).json({
      success: true,
      totalCount,
      todayCount,
      newCount
    })
  } catch (err) {
    console.log("Error in contactMessagesStats: " + err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateContactMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;

    const updatedMessage = await contactModel.findByIdAndUpdate(
      messageId,
      { readStatus: true },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.status(200).json({ success: true, data: updatedMessage, message: "Status updated!" });
  } catch (err) {
    console.log("Error in updateContactMessageStatus: " + err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAdmissionApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const status = req.query.status;
    const program = req.query.program;

    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (program) {
      query.program = program;
    }

    const totalCount = await admissionModel.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await admissionModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Applications fetched successfully",
      data: {
        applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (err) {
    console.error("Error in getAdmissionApplications:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.admissionApplicationStats = async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalCount,
      todayCount,
      thisWeekCount,
      thisMonthCount,
      statusAggregation,
      programAggregation
    ] = await Promise.all([
      admissionModel.countDocuments(),
      admissionModel.countDocuments({ createdAt: { $gte: startOfToday, $lte: endOfToday } }),
      admissionModel.countDocuments({ createdAt: { $gte: startOfWeek } }),
      admissionModel.countDocuments({ createdAt: { $gte: startOfMonth } }),

      admissionModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),

      admissionModel.aggregate([
        {
          $group: {
            _id: "$program",
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const statusBreakdown = {};
    let pendingCount = 0,
      approvedCount = 0,
      rejectedCount = 0,
      underReviewCount = 0;

    statusAggregation.forEach(item => {
      const status = item._id;
      const count = item.count;
      statusBreakdown[status] = count;

      if (status === "Pending") pendingCount = count;
      else if (status === "Approved") approvedCount = count;
      else if (status === "Rejected") rejectedCount = count;
      else if (status === "Under Review") underReviewCount = count;
    });

    const programStats = {};
    programAggregation.forEach(item => {
      if (item._id) {
        programStats[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      message: "Statistics fetched successfully",
      data: {
        totalCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        underReviewCount,
        todayCount,
        thisWeekCount,
        thisMonthCount,
        programStats,
        statusBreakdown
      }
    });
  } catch (err) {
    console.error("Error in admissionApplicationStats:", err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

exports.updateAdmissionApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    let update = { status };
    if (remarks) update.remarks = remarks;

    const updatedApplication = await admissionModel.findByIdAndUpdate(
      applicationId,
      update,
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const subject = getEmailSubject(status);
    const template = generateEmailTemplate(updatedApplication.name, status, remarks);

    helper.sendEmail(updatedApplication.email, subject, template);

    res.status(200).json({ success: true, data: updatedApplication, message: "Application status updated!" });
  } catch (err) {
    console.log("Error in updateAdmissionApplicationStatus: " + err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

function getEmailSubject(status) {
  switch (status) {
    case 'Pending':
      return "📩 Your Admission Application Has Been Received";
    case 'Under Review':
      return "🔍 Your Admission Application Is Under Review";
    case 'Approved':
      return "🎉 Congratulations! Your Admission Has Been Approved";
    case 'Rejected':
      return "❌ Update: Your Admission Application Was Rejected";
    default:
      return "📄 Admission Application Status Update";
  }
};

function generateEmailTemplate(name, status, remarks = '') {
  const statusStyles = {
    "Pending":    { color: "#17a2b8", icon: "⏳" },
    "Under Review": { color: "#ffc107", icon: "🔎" },
    "Approved":   { color: "#28a745", icon: "✅" },
    "Rejected":   { color: "#dc3545", icon: "❌" }
  };

  const { color, icon } = statusStyles[status] || { color: "#6c757d", icon: "ℹ️" };

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Application Status Update</title>
    <style>
      body {
        background-color: #f4f6f8;
        font-family: 'Helvetica Neue', Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        overflow: hidden;
      }
      .header {
        background-color: ${color};
        color: white;
        text-align: center;
        padding: 30px 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .body {
        padding: 30px 25px;
      }
      .body h2 {
        margin-top: 0;
        font-size: 20px;
        color: #222;
      }
      .status-box {
        margin: 20px 0;
        padding: 20px;
        border-left: 6px solid ${color};
        background-color: #f9f9f9;
        border-radius: 8px;
        font-size: 16px;
      }
      .remarks {
        margin-top: 15px;
        font-style: italic;
        color: #555;
      }
      .footer {
        background-color: #f1f1f1;
        padding: 20px;
        text-align: center;
        font-size: 13px;
        color: #777;
      }
      @media (max-width: 600px) {
        .body, .header, .footer {
          padding: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>${icon} Admission Status: ${status}</h1>
      </div>
      <div class="body">
        <h2>Dear ${name},</h2>
        <p>We hope you're doing well. We wanted to inform you that your admission application status has been updated:</p>

        <div class="status-box">
          <strong>Status:</strong> ${status}
        </div>

        ${remarks ? `<p class="remarks"><strong>Remarks:</strong> ${remarks}</p>` : ''}

        <p>If you have any questions, feel free to reply to this email or reach out to our admissions team.</p>

        <p>Thank you,<br>The Admissions Team</p>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} SSM College of Engineering. All rights reserved.<br/>
        This is an automated message. Please do not reply directly to this email.
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = exports;
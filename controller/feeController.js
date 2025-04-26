const StudentFee = require("../models/studentModel");
const moment = require("moment");
const nodemailer = require("nodemailer");
const feesUpdateRequestModel = require("../models/feesUpdateRequestModel");
const studentModel = require("../models/studentModel");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

exports.updateFee = async (req, res) => {
  try {
    let { totalFee, paidFee, semester, alertStudent, paymentType } = req.body;
    const studentId = req.params.userId;
    
    let studentData = await StudentFee.findById(studentId);
    if (!studentData) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    let totalFeeNum = Number(totalFee);
    let newPaidFee = Number(paidFee);
    let pendingFeeNum = totalFeeNum - newPaidFee;

    let status;
    if (newPaidFee === 0) {
      status = "Pending";
    } else if (totalFeeNum === newPaidFee) {
      status = "Paid";
    } else {
      status = "Partial";
    }

    let updateData = await StudentFee.findByIdAndUpdate(studentId, {
      "tuitionFees.totalFee": totalFeeNum,
      "tuitionFees.paidFee": newPaidFee,
      "tuitionFees.pendingFee": pendingFeeNum,
      "tuitionFees.status": status,
      "tuitionFees.semester": semester,
    }, { new: true });

    if (alertStudent) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "verifyuserofficial@gmail.com",
          pass: "wsdv megz vecp wzen",
        },
      });

      let headerSignature = Buffer.from(studentData.studentId.toString()).toString('base64');

      let payUrl = `${req.protocol}://${req.get('host')}/v1/api/createRazorPayPaymentByMail?studentId=${encodeURIComponent(studentData.studentId)}&signature=${encodeURIComponent(headerSignature)}&paymentType=${encodeURIComponent(paymentType)}`;

      const mailOptions = {
        from: "verifyuserofficial@gmail.com",
        to: studentData.email,
        subject: `${paymentType} fees Payment Update Notification` ,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Fee Payment Update Notification</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Inter', sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.5;
              }

              a {
                color: white;
              }
              
              .container {
                background-color: #ffffff;
                margin: 0 auto;
                max-width: 550px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              }
              
              .header {
                padding: 24px;
                border-bottom: 1px solid #f0f0f0;
              }
              
              .header-title {
                color: #0070f3;
                font-size: 20px;
                font-weight: 600;
                margin: 0;
              }
              
              .content {
                padding: 24px;
              }
              
              p {
                color: #555;
                font-size: 15px;
                margin-bottom: 16px;
              }
              
              .fee-details {
                background-color: #f9f9f9;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
              }
              
              .fee-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              
              .fee-label {
                font-weight: 500;
                color: #666;
              }
              
              .fee-value {
                font-weight: 600;
              }
              
              .fee-value.pending {
                color: #ff4757;
              }
              
              .divider {
                height: 1px;
                background-color: #eaeaea;
                margin: 8px 0;
              }
              
              .btn-container {
                text-align: center;
                color: white;
                margin: 24px 0;
              }
              
              .btn img {
                width: 200px;
                height: auto;
              }
              
              .note {
                font-size: 14px;
                color: #888;
                font-style: italic;
              }
              
              .signature {
                margin-top: 24px;
              }
              
              .footer {
                background-color: #f9f9f9;
                padding: 16px;
                text-align: center;
                font-size: 13px;
                color: #888;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 class="header-title">${paymentType} Fee Payment Update</h2>
              </div>
              
              <div class="content">
                <p>Dear <strong>${studentData.name}</strong>,</p>
                
                <p>Your ${paymentType} fees (semester ${semester}) details have been updated in our system.</p>
                
                <div class="fee-details">
                  <div class="fee-row">
                    <span class="fee-label">Total Fee:</span>
                    <span class="fee-value">Rs. ${totalFeeNum}</span>
                  </div>
                  <div class="divider"></div>
                  <div class="fee-row">
                    <span class="fee-label">Pending Amount:</span>
                    <span class="fee-value pending">Rs. ${pendingFeeNum}</span>
                  </div>
                </div>
                
                <p>Please make your payment before the due date to avoid any late penalties.</p>
                
                <div class="btn-container">
                  <a href="${payUrl}" class="btn">
                    <img src="https://i.postimg.cc/sx3WfmV7/Screenshot-2025-03-30-043126-removebg-preview.png" alt="Pay Now">
                  </a>
                </div>
                
                <p class="note">If you have already made the payment, please disregard this message.</p>
                
                <div class="signature">
                  <p>Best regards,<br><strong>Sarankumar</strong></p>
                </div>
              </div>
              
              <div class="footer">
                <p>This is an automated message. Please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(`Error sending email to ${studentData.email}:`, err);
        } else {
          console.log(`Fee update notification sent to ${studentData.email}.`);
        }
      });
    }

    res.json({
      success: true,
      message: "Fees updated successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update fees",
    });
  }
};

exports.updateExamFee = async (req, res) => {
  try {
    let { totalFee, paidFee, semester, alertStudent, paymentType } = req.body;
    const studentId = req.params.userId;
    
    let studentData = await StudentFee.findById(studentId);
    if (!studentData) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    let totalFeeNum = Number(totalFee);
    let newPaidFee = Number(paidFee);
    let pendingFeeNum = totalFeeNum - newPaidFee;

    let status;
    if (newPaidFee === 0) {
      status = "Pending";
    } else if (totalFeeNum === newPaidFee) {
      status = "Paid";
    } else {
      status = "Partial";
    }

    let updateData = await StudentFee.findByIdAndUpdate(studentId, {
      "examFees.totalFee": totalFeeNum,
      "examFees.paidFee": newPaidFee,
      "examFees.pendingFee": pendingFeeNum,
      "examFees.status": status,
      "examFees.semester": semester,
    }, { new: true });

    if (alertStudent) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "verifyuserofficial@gmail.com",
          pass: "wsdv megz vecp wzen",
        },
      });

      let headerSignature = Buffer.from(studentData.studentId.toString()).toString('base64');

      let payUrl = `${req.protocol}://${req.get('host')}/v1/api/createRazorPayPaymentByMail?studentId=${encodeURIComponent(studentData.studentId)}&signature=${encodeURIComponent(headerSignature)}&paymentType=${encodeURIComponent(paymentType)}`;

      const mailOptions = {
        from: "verifyuserofficial@gmail.com",
        to: studentData.email,
        subject: `${paymentType} fees Payment Update Notification` ,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Fee Payment Update Notification</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Inter', sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
                color: #333;
                line-height: 1.5;
              }

              a {
                color: white;
              }
              
              .container {
                background-color: #ffffff;
                margin: 0 auto;
                max-width: 550px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              }
              
              .header {
                padding: 24px;
                border-bottom: 1px solid #f0f0f0;
              }
              
              .header-title {
                color: #0070f3;
                font-size: 20px;
                font-weight: 600;
                margin: 0;
              }
              
              .content {
                padding: 24px;
              }
              
              p {
                color: #555;
                font-size: 15px;
                margin-bottom: 16px;
              }
              
              .fee-details {
                background-color: #f9f9f9;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
              }
              
              .fee-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              
              .fee-label {
                font-weight: 500;
                color: #666;
              }
              
              .fee-value {
                font-weight: 600;
              }
              
              .fee-value.pending {
                color: #ff4757;
              }
              
              .divider {
                height: 1px;
                background-color: #eaeaea;
                margin: 8px 0;
              }
              
              .btn-container {
                text-align: center;
                color: white;
                margin: 24px 0;
              }
              
              .btn img {
                width: 200px;
                height: auto;
              }
              
              .note {
                font-size: 14px;
                color: #888;
                font-style: italic;
              }
              
              .signature {
                margin-top: 24px;
              }
              
              .footer {
                background-color: #f9f9f9;
                padding: 16px;
                text-align: center;
                font-size: 13px;
                color: #888;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 class="header-title">${paymentType} Fee Payment Update</h2>
              </div>
              
              <div class="content">
                <p>Dear <strong>${studentData.name}</strong>,</p>
                
                <p>Your ${paymentType} fees (semester ${semester}) details have been updated in our system.</p>
                
                <div class="fee-details">
                  <div class="fee-row">
                    <span class="fee-label">Total Fee:</span>
                    <span class="fee-value">Rs. ${totalFeeNum}</span>
                  </div>
                  <div class="divider"></div>
                  <div class="fee-row">
                    <span class="fee-label">Pending Amount:</span>
                    <span class="fee-value pending">Rs. ${pendingFeeNum}</span>
                  </div>
                </div>
                
                <p>Please make your payment before the due date to avoid any late penalties.</p>
                
                <div class="btn-container">
                  <a href="${payUrl}" class="btn">
                    <img src="https://i.postimg.cc/sx3WfmV7/Screenshot-2025-03-30-043126-removebg-preview.png" alt="Pay Now">
                  </a>
                </div>
                
                <p class="note">If you have already made the payment, please disregard this message.</p>
                
                <div class="signature">
                  <p>Best regards,<br><strong>Sarankumar</strong></p>
                </div>
              </div>
              
              <div class="footer">
                <p>This is an automated message. Please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(`Error sending email to ${studentData.email}:`, err);
        } else {
          console.log(`Fee update notification sent to ${studentData.email}.`);
        }
      });
    }

    res.json({
      success: true,
      message: "Fees updated successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update fees",
    });
  }
};

exports.viewDueDatePage = async (req, res) => {
  let body = req.body;
  try {
    res.render('dueDate', { year: body.year, course: body.course });
  } catch (err) {
    console.log(err);
    return res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.updateDueDate = async (req, res) => {
  let body = req.body;
  try {

    body.tutionDueDate = moment(body.tutionDueDate).format('DD-MM-YYYY');
    body.examDueDate = moment(body.examDueDate).format('DD-MM-YYYY');

    let filter = {
      year: body.year,
      course: body.course,
    };

    await StudentFee.updateMany(filter, {
      "tuitionFees.dueDate": body.tutionDueDate,
      "examFees.dueDate": body.examDueDate
    });

    res.json({
      success: true,
      message: "Due Dates updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update due dates",
    });
  }
};

exports.getStudentsTuitionFeesList = async (req, res) => {
  let body = req.body;
  let year = body.year;
  let course = body.course;

  try {

    res.render("studentFeeList", { year: year,course: course });

  } catch (err) {
    console.log("Error in getFirstYearTuitionFeesList: " + err);
    return res.status(404).render('error', { message: "Unable to fetch students fees list! please try again later." });
  }
};

exports.getStudentsFeesData = async (req, res) => {
  let body = req.body;
  let year = body.year;
  let course = body.course;
  let type = body.type;

  let totalFees = 0;
  let paidFees = 0;
  let pendingFees = 0;
  let studentsCount = 0;
  let paidStudents = 0
  let pendingStudents = 0
  
  try {
    
    let studentsData = await StudentFee.find({ isDelete: false, isAlumni: false, year: year, course: course });

    if (type === "Tuition") {
      studentsData = studentsData.map(student => ({
        ...student._doc,
        totalFee: Number(student.tuitionFees.totalFee) || 0,
        paidFeeTu: Number(student.tuitionFees.paidFee) || 0,
        pendingFee: Number(student.tuitionFees.pendingFee) || 0
      }));
  
      studentsData.sort((a, b) => a.name.localeCompare(b.name));
  
      totalFees = studentsData.reduce((sum, student) => sum + student.tuitionFees.totalFee, 0);
      paidFees = studentsData.reduce((sum, student) => sum + student.tuitionFees.paidFee, 0);
      pendingFees = studentsData.reduce((sum, student) => sum + student.tuitionFees.pendingFee, 0);
      studentsCount = studentsData.length;
  
      paidStudents = studentsData.filter(student => student.tuitionFees.paidFee > 0).length;
      pendingStudents = studentsData.filter(student => student.tuitionFees.pendingFee > 0).length;
    } else if (type === "Exam") {
      studentsData = studentsData.map(student => ({
        ...student._doc,
        totalFee: Number(student.examFees.totalFee) || 0,
        paidFeeTu: Number(student.examFees.paidFee) || 0,
        pendingFee: Number(student.examFees.pendingFee) || 0
      }));
  
      studentsData.sort((a, b) => a.name.localeCompare(b.name));
  
      totalFees = studentsData.reduce((sum, student) => sum + student.examFees.totalFee, 0);
      paidFees = studentsData.reduce((sum, student) => sum + student.examFees.paidFee, 0);
      pendingFees = studentsData.reduce((sum, student) => sum + student.examFees.pendingFee, 0);
      studentsCount = studentsData.length;
  
      paidStudents = studentsData.filter(student => student.examFees.paidFee > 0).length;
      pendingStudents = studentsData.filter(student => student.examFees.pendingFee > 0).length;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json({ 
      success: true,
      studentsData: studentsData, 
      totalFees: totalFees,
      paidFees: paidFees,
      pendingFees: pendingFees,
      studentsCount: studentsCount,
      paidStudents: paidStudents,
      pendingStudents: pendingStudents,
      year: year,
      course: course
    });

  } catch (err) {
    console.log("Error in getStudentsFeesData: " + err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error! Please try again later.",
      studentsData: [], 
      totalFees: totalFees,
      paidFees: paidFees,
      pendingFees: pendingFees,
      studentsCount: studentsCount,
      paidStudents: paidStudents,
      pendingStudents: pendingStudents,
      year: year,
      course: course
    });
  }
};

exports.getSecondYearTuitionFeesList = async (req, res) => {
  try {
    let studentsData = await StudentFee.find({ isDelete: false, isAlumni: false, year: "II" });

    studentsData = studentsData.map(student => ({
      ...student._doc,
      totalFee: Number(student.examFees.totalFee) || 0,
      paidFeeTu: Number(student.examFees.paidFee) || 0,
      pendingFee: Number(student.examFees.pendingFee) || 0
    }));

    studentsData.sort((a, b) => a.name.localeCompare(b.name));

    let totalFees = studentsData.reduce((sum, student) => sum + student.examFees.totalFee, 0);
    let paidFees = studentsData.reduce((sum, student) => sum + student.examFees.paidFee, 0);
    let pendingFees = studentsData.reduce((sum, student) => sum + student.examFees.pendingFee, 0);
    let studentsCount = studentsData.length;

    const paidStudents = studentsData.filter(student => student.examFees.paidFee > 0).length;
    const pendingStudents = studentsData.filter(student => student.examFees.pendingFee > 0).length;

    res.render("studentFeeList", { 
      studentsData, 
      totalFees,
      paidFees,
      pendingFees,
      studentsCount,
      paidStudents,
      pendingStudents,
      year: "II"
    });
  } catch (err) {
    console.log("Error in getSecondYearTuitionFeesList: " + err);
    res.send("Failed to retrive data");
  }
};

exports.getStudentsExamFeesList = async (req, res) => {
  let body = req.body;
  let year = body.year;
  let course = body.course;
  try {

    res.render("studentExamFeeList", { 
      year: year,
      course: course
    });
  } catch (err) {
    console.log("Error in getFirstYearExamFeesList: " + err);
    return res.status(404).render('error', { message: "Unable to fetch students fees list! please try again later." });
  }
};

exports.getSecondYearExamFeesList = async (req, res) => {
  try {
    let studentsData = await StudentFee.find({ isDelete: false, isAlumni: false, year: "II" });

    studentsData = studentsData.map(student => ({
      ...student._doc,
      examTotalFee: Number(student.examTotalFee) || 0,
      paidFeeEx: Number(student.paidFeeEx) || 0,
      examPendingFee: Number(student.examPendingFee) || 0
    }));

    studentsData.sort((a, b) => a.name.localeCompare(b.name));

    let totalFees = studentsData.reduce((sum, student) => sum + student.examTotalFee, 0);
    let paidFees = studentsData.reduce((sum, student) => sum + student.paidFeeEx, 0);
    let pendingFees = studentsData.reduce((sum, student) => sum + student.examPendingFee, 0);
    let studentsCount = studentsData.length;

    const paidStudents = studentsData.filter(student => student.paidFeeEx > 0).length;
    const pendingStudents = studentsData.filter(student => student.examPendingFee > 0).length;

    res.render("studentExamFeeList", { 
      studentsData, 
      totalFees,
      paidFees,
      pendingFees,
      studentsCount,
      paidStudents,
      pendingStudents,
      year: "II"
    });
  } catch (err) {
    console.log("Error in getSecondYearExamFeesList: " + err);
    res.send("Failed to retrive data");
  }
};

exports.feesUpdateRequest = async (req, res) => {
  try {
      let studentId = req.params.studentId;
      let feeType = req.params.feeType;
      let student = await studentModel.findById(studentId);

      res.render("feesUpdateRequest", { student, feeType });
    } catch (err) {
      console.log("Error in feesUpdateRequest: " + err);
      return res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
    }
};

exports.submitFeeUpdateRequest = async (req, res) => {
  let body = req.body;
  try {
    const uploadToCloudinary = (fileBuffer, fileName) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: fileName,
            resource_type: "auto",
            folder: "Fees Request",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject("Error uploading file to Cloudinary.");
            }
            resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });
    };

    let cloudinaryResult;
    if (req.file) {
      let fileName = req.file.originalname ? req.file.originalname : "";
      cloudinaryResult = await uploadToCloudinary(req.file.buffer, fileName);
    }

    let now = new Date();
    let pad = (n) => n.toString().padStart(2, '0');

    let requestId = `FEE-REQ-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    let feeReq = new feesUpdateRequestModel({
      studentId: req.student._id,
      requestId: requestId,
      feeType: body.feeType,
      upiReference: body.upiReference,
      amountDetails: {
        currentPaidAmount: Number(body.currentPaidAmount),
        paidAmount: Number(body.paidAmount),
        pendingAmount: Number(body.pendingAmount)
      },
      course: body.course,
      year: body.year,
      semester: body.semester,
      comments: body.comments,
      attachment: cloudinaryResult?.secure_url ? cloudinaryResult?.secure_url : '',
    });

    await feeReq.save();
    res.status(200).json({ success: true, message: `${body.feeType} fees update request submitted` });
  } catch (err) {
    console.error('Error in submitFeeUpdateRequest: ', err);
    res.status(500).json({ success: false, message: 'Internal Server error' });
  }
};

exports.feesUpdateRequestList = async (req, res) => {
  try {
    let body = req.body;
    let year = body.year;
    let course = body.course;

    res.render("feesUpdateRequestList", { 
      year: year,
      course: course,
    });
  } catch (err) {
    console.log("Error in getFirstYearExamFeesList: " + err);
    return res.status(404).render('error', { message: "Internal Server Error!. Please try again later" });
  }
};

exports.feesUpdateRequestListData = async (req, res) => {
  let body= req.body;
  try {
    let course = body.course;
    let year = body.year;
    let feesUpdateRequests = await feesUpdateRequestModel.find({ course: course, year: year }).populate('studentId').sort({ appliedOn: -1 });

    res.status(200).json({ success: true, data: feesUpdateRequests });

  } catch (err) {
    console.error('Error in feesUpdateRequestListData: ', err);
    res.status(500).json({ success: false, message: 'Internal Server error' });
  }
};

exports.getStudentFeeUpdateReq = async (req, res) => {
  let body= req.body;
  try {
    let feesUpdateRequests = await feesUpdateRequestModel.find({ studentId: body.studentId }).populate('studentId').sort({ appliedOn: -1 });

    res.status(200).json({ success: true, data: feesUpdateRequests });

  } catch (err) {
    console.error('Error in feesUpdateRequestListData: ', err);
    res.status(500).json({ success: false, message: 'Internal Server error' });
  }
};

exports.updateFeeRequestStatus = async (req, res) => {
  try {
    let { status, adminComment, feeRequestId} = req.body;

    let feeReqData = await feesUpdateRequestModel.findById(feeRequestId);

    let studentData = await studentModel.findById(feeReqData.studentId);

    if (!feeReqData) return res.status(404).json({ sucess: false, message: 'Request not found' });

    if (status === 'Approved') {

      if (feeReqData.feeType === "Tuition") {
        studentData.tuitionFees.paidFee = feeReqData?.amountDetails?.paidAmount;
        studentData.tuitionFees.pendingFee = feeReqData?.amountDetails?.pendingAmount;

        let paymentStatus = "Pending";
        if (studentData.tuitionFees.totalFee === studentData.tuitionFees.paidFee) paymentStatus = "Paid"
        if (studentData.tuitionFees.totalFee !== studentData.tuitionFees.paidFee) paymentStatus = "Partial"

        studentData.tuitionFees.status = paymentStatus;

        feeReqData.status = status;
        feeReqData.adminComment = adminComment || '';

        await studentData.save();
        await feeReqData.save();
      }

      if (feeReqData.feeType === "Exam") {
        studentData.examFees.paidFee = feeReqData?.amountDetails?.paidAmount;
        studentData.examFees.pendingFee = feeReqData?.amountDetails?.pendingAmount;

        let paymentStatus = "Pending";
        if (studentData.examFees.totalFee === studentData.examFees.paidFee) paymentStatus = "Paid"
        if (studentData.examFees.totalFee !== studentData.examFees.paidFee) paymentStatus = "Partial"

        studentData.examFees.status = paymentStatus;

        feeReqData.status = status;
        feeReqData.adminComment = adminComment || '';
        
        await studentData.save();
        await feeReqData.save();
      }
    
    } else {
      feeReqData.status = status;
      feeReqData.adminComment = adminComment || '';

      await feeReqData.save();
    }

    res.status(200).json({ success: true, message: `Fees request ${status.toLowerCase()} successfully.` });

  } catch (err) {
    console.log("Error in updateFeeRequestStatus: " + err);
    res.status(500).json({ success: false, message: 'Internal Server error' });
  }
};

module.exports = exports;

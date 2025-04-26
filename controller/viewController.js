const express = require("express");
const path = require("path");
const fs = require('fs');
const Admin = require("../models/adminModel");
const mongoose = require('mongoose');
const Student = require("../models/studentModel");
const studentController = require("../controller/studentController")
const Subject = require("../models/studyMaterial");
const admissionModel = require("../models/admissionModel");
const Contact = require("../models/contactModel");
const Image = require("../models/imageModel");
const AttendanceModel = require("../models/attendanceModel");
const puppeteer = require('puppeteer');
const hbs = require("hbs");
const app = express();
const { verify } = require("jsonwebtoken");
app.use(express.static(path.join(__dirname, "../Images")));
const moment = require("moment");
const studyMaterialModel = require("../models/studyMaterial");

app.use(express.static("Images"));

const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

hbs.registerHelper('eq', function(v1, v2) {
  return v1 === v2;
});

exports.dashboard = async (req, res) => {
    const accessToken = req.cookies["access-token"];
  try {
    const decodedToken = await verify(
      accessToken,
      "qwertyuiopasdfghjklzxcvbnm"
    );
    const userId = decodedToken.id;

    const user = await Admin.findOne({ _id: new mongoose.Types.ObjectId(userId) });

    // res.render("admin", { user });
    res.render("dashboard", { user });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).send("Failed to fetch user details");
  }
};

exports.reviewRequest = async (req, res) => {
    try {
        const students = await Student.find({ 'editRequest.status': 'requested', isDelete: false, isAlumni: false });
        res.render('requestReview', { students });
    } catch (err) {
        console.log(err.message, err);
        return res.json(err.message);
    }
};

exports.reviewRequestTu = async (req, res) => {
    try {
        const students = await Student.find({ 'tuEditRequest.status': 'requested', isDelete: false, isAlumni: false });
        res.render('tuRequestReview', { students });
    } catch (err) {
        console.log(err.message, err);
        return res.json(err.message);
    }
};

exports.reviewRequestEx = async (req, res) => {
    try {
        const students = await Student.find({ 'exEditRequest.status': 'requested', isDelete: false, isAlumni: false });
        res.render('exRequestReview', { students });
    } catch (err) {
        console.log(err.message, err);
        return res.json(err.message);
    }
};

exports.studentProfileEdit = async (req, res) => {
    try {
        const userId = req.params.userId;
        const student = await Student.findById(userId);
        res.render("stdProfileEdit", { student });
      } catch (err) {
        console.error(err);
        res.send("Error");
      }
};

exports.studentAddressUpdate = async (req, res) => {
    try {
        const userId = req.params.userId;
        const student = await Student.findById(userId);
        res.render("updateAddress", { student });
      } catch (err) {
        console.error(err);
        res.send("Error");
      }
};

exports.addressUpdateReq = async (req, res) => {
  res.render("addressUpdateReq");
};

exports.studentProfileTuEdit = async (req, res) => {
    try {
        const userId = req.params.userId;
        const student = await Student.findById(userId);
        res.render("stdProfileTuEdit", { student });
      } catch (err) {
        console.error(err);
        res.send("Error");
      }
};

exports.studentProfileExEdit = async (req, res) => {
    try {
        const userId = req.params.userId;
        const student = await Student.findById(userId);
        res.render("stdProfileExEdit", { student });
      } catch (err) {
        console.error(err);
        res.send("Error");
      }
};

exports.getStudentRegister = async (req, res) => {
  res.render("register", { course: req.body.course });
};

exports.announcement = async (req, res) => {
  res.render("announcement");
};

exports.commonAnnouncement = async (req, res) => {
  res.render("commonAnnouncement");
};

exports.getPaymentAlert = async (req, res) => {
  let body = req.body;
  try {
    res.render('paymentsAlert', { year: body.year, course: body.course });
  } catch (err) {
    console.log(err);
    return res.status(404).render('error', { message: "Internal Server Error! Please try again later." });
  }
};

exports.updateDueDatesForAll = async (req, res) => {
  res.render("dueDate");
};

exports.feeRegister = async (req, res) => {
  res.render("feeRegister");
};

exports.subject = async (req, res) => {
  res.render("subject");
};

exports.moveStudents = async (req, res) => {
  const { course, year } = req.body;
  
  const courseDurations = {
    'MCA': 2,
    'BCA': 3,
    'MBA': 2,
    'EEE': 4,
    'CSE': 4,
    'ECE': 4,
    'Civil': 4,
    'Mechanical': 4,
    'BTech': 4
  };  

  const yearMapping = {
    "I": 1,
    "II": 2,
    "III": 3,
    "IV": 4
  };

  const currentYear = yearMapping[year];
  const courseDuration = courseDurations[course];

  let moveToYear;
  if (currentYear >= courseDuration) {
    moveToYear = "Alumni";
  } else {
    const nextYear = currentYear + 1;
    moveToYear = Object.keys(yearMapping).find(key => yearMapping[key] === nextYear);
  }

  res.render("moveStudents", { course: course, year: year, moveToYear: moveToYear, isAlumni: moveToYear === "Alumni"});
};

exports.message = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.render("message", { messages });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

exports.studentList = async (req, res) => {
  try {
    const allStudents = await Student.find({ isDelete: false, isAlumni: false });
    const firstYearStudents = allStudents.filter(
      (student) => student.year === "I"
    );
    const secondYearStudents = allStudents.filter(
      (student) => student.year === "II"
    );

    let firstYearTotalCount = firstYearStudents.length;
    let secondYearTotalCount = secondYearStudents.length;

    let sortedFirstYear = firstYearStudents.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    
    let sortedSecondYear = secondYearStudents.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    const firstYearMaleCount = firstYearStudents.filter(
      (student) => student.gender === "Male"
    ).length;

    const firstYearFemaleCount = firstYearStudents.filter(
      (student) => student.gender === "Female"
    ).length;

    const secondYearMaleCount = secondYearStudents.filter(
      (student) => student.gender === "Male"
    ).length;

    const secondYearFemaleCount = secondYearStudents.filter(
      (student) => student.gender === "Female"
    ).length;

    res.render("studentList", { sortedFirstYear, sortedSecondYear, firstYearTotalCount, firstYearMaleCount, firstYearFemaleCount, secondYearTotalCount, secondYearMaleCount, secondYearFemaleCount });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};


exports.studentEdit = async (req, res) => {
  try {
    const userId = req.params.userId;
    const student = await Student.findById(userId).lean();
    const backUrl = `/v1/api/getStudentsList?course=${encodeURIComponent(student.course)}&year=${encodeURIComponent(student.year)}`;
    res.render("studentEdit", { student, backUrl });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.staffEdit = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Admin.findById(userId);
    res.render("staffEdit", { user });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.alumniList = async (req, res) => {
  try {
    let filterYear = req.query.year || null;
    let searchName = req.query.name || "";
    let searchId = req.query.studentId || "";
    let course = req.query.course || "";
    let gender = req.query.gender || "";
    
    if (req.query.download) {
      req.body.isPdf = true;
      let response = await studentController.studentAlumniDownload(req, res);
      if (response.success) {
        res.writeHead(200, {
          "Content-Length": Buffer.byteLength(response.buffer),
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename = MCA ${filterYear || "All"} Alumni Students list.pdf`
        });
        res.end(response.buffer);
      } else {
        res.status(500).send({ success: false, message: "Error generating PDF" });
      }
    } else {
      let query = { isDelete: false, isAlumni: true };
      if (filterYear && filterYear !== "All") {
        query.graduationYear = filterYear;
      }
      
      if (searchName) {
        query.name = { $regex: new RegExp(searchName, "i") };
      }

      if (gender) {
        query.gender = { $regex: new RegExp(gender, "i") };
      }

      if (course) {
        query.course = { $regex: new RegExp(course, "i") };
      }

      if (searchId) {
        query.studentId = { $regex: new RegExp(searchId, "i") };
      }
      
      let students = await Student.find(query);
      let gradYears = await Student.distinct("graduationYear", { isDelete: false, isAlumni: true });
      gradYears.unshift("All");

      students = students.sort((a, b) => {
        if (b.graduationYear === a.graduationYear) {
          return a.name.localeCompare(b.name);
        }
        return b.graduationYear - a.graduationYear;
      });
      
      res.render("alumniList", { students, filterYear, gradYears, searchName });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: err.message });
  }
};

exports.staffList = async (req, res) => {
  try {
    const staffData = await Admin.find({ isDelete: false });

    res.render("staffList", { staffData });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.subjectList = async (req, res) => {
  try {
    const allStudents = await Subject.find({ isDelete: false });
    const firstYear = allStudents.filter(
      (subject) => subject.year === "I"
    );
    const secondYear = allStudents.filter(
      (subject) => subject.year === "II"
    );

    res.render("subjectList", { firstYear, secondYear });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.alumniStatus = async (req, res) => {
  try {
    await Student.updateMany({}, { $set: { graduationYear: req.body.graduationYear } });
    res.status(200).json({ message: `Successfully updated all students to isAlumni: ${req.body.graduationYear}.` });
  } catch (error) {
    console.error("Error occurred while updating students:", error);
    res.status(500).json({ error: "Failed to update students." });
  }
};

exports.studentFeeList = async (req, res) => {
  try {
    let allStudents = await Student.find({ isDelete: false, isAlumni: false });

    let firstYearStudents = allStudents.filter(student => student.year === "I");
    let secondYearStudents = allStudents.filter(student => student.year === "II");

    firstYearStudents = firstYearStudents.map(student => ({
      ...student._doc,
      totalFee: Number(student.totalFee) || 0,
      paidFeeTu: Number(student.paidFeeTu) || 0,
      pendingFee: Number(student.pendingFee) || 0
    }));

    secondYearStudents = secondYearStudents.map(student => ({
      ...student._doc,
      totalFee: Number(student.totalFee) || 0,
      paidFeeTu: Number(student.paidFeeTu) || 0,
      pendingFee: Number(student.pendingFee) || 0
    }));

    firstYearStudents.sort((a, b) => a.name.localeCompare(b.name));
    secondYearStudents.sort((a, b) => a.name.localeCompare(b.name));

    let firstYearTotalFee = firstYearStudents.reduce((sum, student) => sum + student.totalFee, 0);
    let firstYearPaidFee = firstYearStudents.reduce((sum, student) => sum + student.paidFeeTu, 0);
    let firstYearPendingFee = firstYearStudents.reduce((sum, student) => sum + student.pendingFee, 0);
    let firstYearStudentCount = firstYearStudents.length;

    let secondYearTotalFee = secondYearStudents.reduce((sum, student) => sum + student.totalFee, 0);
    let secondYearPaidFee = secondYearStudents.reduce((sum, student) => sum + student.paidFeeTu, 0);
    let secondYearPendingFee = secondYearStudents.reduce((sum, student) => sum + student.pendingFee, 0);
    let secondYearStudentCount = secondYearStudents.length;

    const firstYearPaidStudents = firstYearStudents.filter(student => student.paidFeeTu > 0).length;
    const firstYearPendingStudents = firstYearStudents.filter(student => student.pendingFee > 0).length;
    const firstYearTotalStudents = firstYearStudents.length;

    const secondYearPaidStudents = secondYearStudents.filter(student => student.paidFeeTu > 0).length;
    const secondYearPendingStudents = secondYearStudents.filter(student => student.pendingFee > 0).length;
    const secondYearTotalStudents = secondYearStudents.length;

    res.render("studentFeeList", { 
      firstYearStudents, 
      secondYearStudents,
      firstYearTotalFee,
      firstYearPaidFee,
      firstYearPendingFee,
      firstYearStudentCount,
      firstYearPaidStudents,
      firstYearPendingStudents,
      firstYearTotalStudents, 
      secondYearTotalFee,
      secondYearPaidFee,
      secondYearPendingFee,
      secondYearStudentCount,
      secondYearPaidStudents,
      secondYearPendingStudents,
      secondYearTotalStudents
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching student fee data");
  }
};

exports.examFeeList = async (req, res) => {
  try {
    let allStudents = await Student.find({ isDelete: false, isAlumni: false });
    let firstYearStudents = allStudents.filter(
      (student) => student.year === "I"
    );
    let secondYearStudents = allStudents.filter(
      (student) => student.year === "II"
    );

    firstYearStudents = firstYearStudents.map(student => ({
      ...student._doc,
      examTotalFee: Number(student.examTotalFee) || 0,
      paidFeeEx: Number(student.paidFeeEx) || 0,
      examPendingFee: Number(student.examPendingFee) || 0
    }));

    secondYearStudents = secondYearStudents.map(student => ({
      ...student._doc,
      examTotalFee: Number(student.examTotalFee) || 0,
      paidFeeEx: Number(student.paidFeeEx) || 0,
      examPendingFee: Number(student.examPendingFee) || 0
    }));

    firstYearStudents = firstYearStudents.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    secondYearStudents = secondYearStudents.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    let firstYearExamTotalFee = firstYearStudents.reduce((sum, student) => sum + student.examTotalFee, 0);
    let firstYearPaidFeeEx = firstYearStudents.reduce((sum, student) => sum + student.paidFeeEx, 0);
    let firstYearExamPendingFee = firstYearStudents.reduce((sum, student) => sum + student.examPendingFee, 0);
    let firstYearStudentCount = firstYearStudents.length;

    let secondYearExamTotalFee = secondYearStudents.reduce((sum, student) => sum + student.examTotalFee, 0);
    let secondYearPaidFeeEx = secondYearStudents.reduce((sum, student) => sum + student.paidFeeEx, 0);
    let secondYearExamPendingFee = secondYearStudents.reduce((sum, student) => sum + student.examPendingFee, 0);
    let secondYearStudentCount = secondYearStudents.length;

    const firstYearPaidStudents = firstYearStudents.filter(student => student.paidFeeEx > 0).length;
    const firstYearPendingStudents = firstYearStudents.filter(student => student.examPendingFee > 0).length;
    const firstYearTotalStudents = firstYearStudents.length;

    const secondYearPaidStudents = secondYearStudents.filter(student => student.paidFeeEx > 0).length;
    const secondYearPendingStudents = secondYearStudents.filter(student => student.examPendingFee > 0).length;
    const secondYearTotalStudents = secondYearStudents.length;

    res.render("examFeeList", { 
      firstYearStudents, 
      secondYearStudents,
      firstYearExamTotalFee,
      firstYearPaidFeeEx,
      firstYearExamPendingFee,
      firstYearStudentCount,
      firstYearPaidStudents, 
      firstYearPendingStudents,
      firstYearTotalStudents, 
      secondYearExamTotalFee,
      secondYearPaidFeeEx,
      secondYearExamPendingFee,
      secondYearStudentCount,
      secondYearPaidStudents, 
      secondYearPendingStudents,
      secondYearTotalStudents 
    });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.examFeeEdit = async (req, res) => {
  try {
    const userId = req.params.userId;
    const fee = await Student.findById(userId);
    const backUrl = `/v1/api/getStudentsExamFeesList?course=${encodeURIComponent(fee.course)}&year=${encodeURIComponent(fee.year)}`;
    res.render("examFeeEdit", { fee, backUrl });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.feeEdit = async (req, res) => {
  try {
    const userId = req.params.userId;
    const fee = await Student.findById(userId);
    const backUrl = `/v1/api/getStudentsTuitionFeesList?course=${encodeURIComponent(fee.course)}&year=${encodeURIComponent(fee.year)}`;
    res.render("feeEdit", { fee, backUrl });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.gallery = async (req, res) => {
  try {
    const apiUrl = "/v1/api/dashboard";
    const images = await Image.find({ isDelete: false}).sort({ createdAt: -1 });
    
    res.render("gallery", { images, apiUrl });
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
};

exports.homeGallery = async (req, res) => {
  try {
    const apiUrl = "/";
    const images = await Image.find({ isDelete: false}).sort({ createdAt: -1 });
    res.render("gallery", { images, apiUrl });
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
};

exports.imagesList = async (req, res) => {
  try {
    let imageData = await Image.find({ isDelete: false}).sort({ createdAt: -1 });
    let formatedData = imageData.map((data) => {
      return {
        ...data.toObject(),
        createdAt: moment(data.createdAt).format('DD-MM-YYYY')
      };
    })
    res.render("imageList", { formatedData });
  } catch (err) {
    res.send(err.message);
  }
}

exports.imageEdit = async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const imageData = await Image.findById(imageId);
    res.render("imageEdit", { imageData });
  } catch (err) {
    console.error(err);
    res.send("Error");
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
      return res.send(
        '<script>alert("Student not Found!"); window.location.href = "/v1/api/signin";</script>'
      );
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
    console.error("Error fetching user details:", err);
    res.status(500).send("Failed to fetch user details");
  }
};

/* exports.downloadFirstYrTuFeePDF = async (req, res) => {
  try {
      const firstYearStudents = await Student.find({ year: 'I', isDelete: false });

      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tuition Fees Details</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f7f7f7;
                  margin: 0;
                  padding: 20px;
              }
      
              .container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 15px;
                  background-color: #fff;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  border-radius: 10px;
              }
      
              h1, h2, h3 {
                  color: #333;
                  text-align: center;
                  padding-top: 1px;
                  margin-bottom: 5px;
              }
      
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 15px;
              }
      
              th, td {
                  border: 1px solid #ccc;
                  padding: 10px;
                  text-align: center;
                  font-size: 16px;
              }
      
              th {
                  background-color: #3e64ff;
                  color: #fff;
              }
      
              tr:nth-child(even) {
                  background-color: #f2f2f2;
              }
      
              tr:hover {
                  background-color: #ddd;
              }
      
              .total {
                  font-weight: bold;
              }
      
              .status-paid {
                  color: green;
              }
      
              .status-pending {
                  color: orange;
              }
      
              .status-due {
                  color: red;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1 style="color:#3e64ff;">SSM COLLEGE OF ENGINEERING</h1>
              <h2>Department Of MCA - I</h2>
              <h3>Tuition Fees Details</h3>
              <table>
                  <thead>
                      <tr>
                          <th>Name</th>
                          <th>Total Fee</th>
                          <th>Pending Fee</th>
                          <th>Payment Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${firstYearStudents.map(student => `
                          <tr>
                              <td style="text-align: left">${student.name}</td>
                              <td>Rs.${student.totalFee}</td>
                              <td>Rs.${student.pendingFee}</td>
                              <td class="${student.paymentStatus}">${student.paymentStatus}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </div>
      </body>
      </html>
      `;

      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdfBuffer = await page.pdf({ 
          format: 'A4',
          printBackground: true
      });

      await browser.close();

      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
      }

      const pdfPath = path.join(tempDir, 'firstYearFeeList.pdf');

      fs.writeFile(pdfPath, pdfBuffer, (err) => {
          if (err) {
              console.error(err);
              return res.status(500).send('Error creating PDF');
          }

          res.download(pdfPath, 'I_MCA_Tuition_Fees_Details.pdf', (err) => {
              if (err) {
                  console.error(err);
                  return res.status(500).send('Error downloading PDF');
              }

              fs.unlinkSync(pdfPath);
          });
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
}; */

/* exports.downloadSecondYrTuFeePDF = async (req, res) => {
  try {
      const secondYearStudents = await Student.find({ year: 'II', isDelete: false });

      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tuition Fees Details</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f7f7f7;
                  margin: 0;
                  padding: 20px;
              }

              .container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 15px; 
                  background-color: #fff;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  border-radius: 10px;
              }

              h1, h2, h3 {
                  color: #333;
                  text-align: center;
                  padding-top: 1px;
                  margin-bottom: 5px;
              }

              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 15px;
              }

              th, td {
                  border: 1px solid #ccc;
                  padding: 10px; 
                  text-align: center;
                  font-size: 16px; 
              }

              th {
                  background-color: #3e64ff;
                  color: #fff;
              }

              tr:nth-child(even) {
                  background-color: #f2f2f2;
              }

              tr:hover {
                  background-color: #ddd;
              }

              .total {
                  font-weight: bold;
              }

              .status-paid {
                  color: green;
              }

              .status-pending {
                  color: orange;
              }

              .status-due {
                  color: red;
              }
          </style>
      </head>
      <body>
          <div class="container">
          <h1 style="color:#3e64ff;">SSM COLLEGE OF ENGINEERING</h1>
              <h2>Department Of MCA - II</h2>
              <h3>Tuition Fees Details</h3>
              <table>
                  <thead>
                      <tr>
                          <th>Name</th>
                          <th>Total Fee</th>
                          <th>Pending Fee</th>
                          <th>Payment Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${secondYearStudents.map(student => `
                          <tr>
                              <td style="text-align: left">${student.name}</td>
                              <td>Rs.${student.totalFee}</td>
                              <td>Rs.${student.pendingFee}</td>
                              <td class="${student.paymentStatus}">${student.paymentStatus}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </div>
      </body>
      </html>
      `;

      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdfBuffer = await page.pdf({ 
          format: 'A4',
          printBackground: true
      });

      await browser.close();

      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
      }

      const pdfPath = path.join(tempDir, 'secondYearFeeList.pdf');

      fs.writeFile(pdfPath, pdfBuffer, (err) => {
          if (err) {
              console.error(err);
              return res.status(500).send('Error creating PDF');
          }

          res.download(pdfPath, 'II_MCA_Tuition_Fees_Details.pdf', (err) => {
              if (err) {
                  console.error(err);
                  return res.status(500).send('Error downloading PDF');
              }

              fs.unlinkSync(pdfPath);
          });
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
}; */

/* exports.downloadFirstYrExFeePDF = async (req, res) => {
  try {
      const firstYearStudents = await Student.find({ year: 'I', isDelete: false });

      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Exam Fees Details</title>
          <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f7f7f7;
              margin: 0;
              padding: 20px;
          }
  
          .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 15px; 
              background-color: #fff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              border-radius: 10px;
          }
  
          h1, h2, h3 {
              color: #333;
              text-align: center;
              padding-top: 1px;
              margin-bottom: 5px;
          }
  
          table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
          }
  
          th, td {
              border: 1px solid #ccc;
              padding: 10px; 
              text-align: center;
              font-size: 16px; 
          }
  
          th {
              background-color: #3e64ff;
              color: #fff;
          }
  
          tr:nth-child(even) {
              background-color: #f2f2f2;
          }
  
          tr:hover {
              background-color: #ddd;
          }
  
          .total {
              font-weight: bold;
          }
  
          .status-paid {
              color: green;
          }
  
          .status-pending {
              color: orange;
          }
  
          .status-due {
              color: red;
          }
      </style>
      </head>
      <body>
          <div class="container">
          <h1 style="color:#3e64ff;">SSM COLLEGE OF ENGINEERING</h1>
              <h2>Department Of MCA - I</h2>
              <h3>Exam Fees Details</h3>
              <table>
                  <thead>
                      <tr>
                          <th>Name</th>
                          <th>Total Fee</th>
                          <th>Pending Fee</th>
                          <th>Payment Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${firstYearStudents.map(student => `
                          <tr>
                              <td style="text-align:left">${student.name}</td>
                              <td>Rs.${student.examTotalFee}</td>
                              <td>Rs.${student.examPendingFee}</td>
                              <td class="${student.examPaymentStatus}">${student.examPaymentStatus}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </div>
      </body>
      </html>
      `;

      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdfBuffer = await page.pdf({ 
          format: 'A4',
          printBackground: true
      });

      await browser.close();

      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
      }

      const pdfPath = path.join(tempDir, 'firstYearExamFeeList.pdf');

      fs.writeFile(pdfPath, pdfBuffer, (err) => {
          if (err) {
              console.error(err);
              return res.status(500).send('Error creating PDF');
          }

          res.download(pdfPath, 'I_MCA_Exam_Fees_Details.pdf', (err) => {
              if (err) {
                  console.error(err);
                  return res.status(500).send('Error downloading PDF');
              }

              fs.unlinkSync(pdfPath); 
          });
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
}; */

/* exports.downloadSecondYrExFeePDF = async (req, res) => {
  try {
      const secondYearStudents = await Student.find({ year: 'II', isDelete: false });

      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Exam Fees Details</title>
          <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f7f7f7;
              margin: 0;
              padding: 20px;
          }
  
          .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 15px; 
              background-color: #fff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              border-radius: 10px;
          }
  
          h1, h2, h3 {
              color: #333;
              text-align: center;
              padding-top: 1px;
              margin-bottom: 5px;
          }
  
          table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
          }
  
          th, td {
              border: 1px solid #ccc;
              padding: 10px; 
              text-align: center;
              font-size: 16px; 
          }
  
          th {
              background-color: #3e64ff;
              color: #fff;
          }
  
          tr:nth-child(even) {
              background-color: #f2f2f2;
          }
  
          tr:hover {
              background-color: #ddd;
          }
  
          .total {
              font-weight: bold;
          }
  
          .status-paid {
              color: green;
          }
  
          .status-pending {
              color: orange;
          }
  
          .status-due {
              color: red;
          }
      </style>
      </head>
      <body>
          <div class="container">
          <h1 style="color:#3e64ff;">SSM COLLEGE OF ENGINEERING</h1>
              <h2>Department Of MCA - II</h2>
              <h3>Exam Fees Details</h3>
              <table>
                  <thead>
                      <tr>
                          <th>Name</th>
                          <th>Total Fee</th>
                          <th>Pending Fee</th>
                          <th>Payment Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${secondYearStudents.map(student => `
                          <tr>
                              <td style="text-align: left">${student.name}</td>
                              <td>Rs.${student.examTotalFee}</td>
                              <td>Rs.${student.examPendingFee}</td>
                              <td class="${student.examPaymentStatus}">${student.examPaymentStatus}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </div>
      </body>
      </html>
      `;

      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html);

      const pdfBuffer = await page.pdf({ 
          format: 'A4',
          printBackground: true
      });

      await browser.close();

      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
      }

      const pdfPath = path.join(tempDir, 'secondYearExamFeeList.pdf');

      fs.writeFile(pdfPath, pdfBuffer, (err) => {
          if (err) {
              console.error(err);
              return res.status(500).send('Error creating PDF');
          }

          res.download(pdfPath, 'II_MCA_Exam_Fees_Details.pdf', (err) => {
              if (err) {
                  console.error(err);
                  return res.status(500).send('Error downloading PDF');
              }

              fs.unlinkSync(pdfPath);
          });
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
}; */

exports.admissionForm = async (req, res) => {
  res.render("admissionForm");
};

exports.admissionFormList = async (req, res) => {
  try {
    let applications = await admissionModel.find({ isDelete: false}).sort({ refNo: -1 });

    res.render("admissionFormList", { applications });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.getTuitionCreatePayment = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('tuitionPayment', { key: process.env.STRIPE_PUBLISHABLE_KEY, studentData });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.getExamCreatePayment = async (req, res) => {
  try {
    let body = req.body;
    let studentData = await Student.findOne({ studentId: body.studentId });
    res.render('examPayment', { key: process.env.STRIPE_PUBLISHABLE_KEY, studentData });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

module.exports = exports;

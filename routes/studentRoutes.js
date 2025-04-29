const express = require("express");
const app = express();
const authonticationController = require("../middleware/auth");
const studentController = require("../controller/studentController");
const path = require("path");
const multer = require("multer");
const subjectCodeModel = require("../models/subjectCodeModel");
const Student = require("../models/studentModel");

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.post(
  "/studentRegister",
  upload.single("image"),
  authonticationController.validateToken,
  studentController.newStudent
);

app.post("/studentLogin", studentController.login);

app.post(
  "/student/forgotPassword",
  studentController.studentForgotPassword
);

app.post(
  "/student/resetPassword",
  studentController.resetPassword
);

app.post(
  "/student/forgotOtp",
  studentController.studentForgotOtp
);

// app.post(
//   "/studentUpdate/:userId",
//   upload.single("image"),
//   authonticationController.validateToken,
//   studentController.updateStudent
// );

app.post(
  "/updateStudent",
  upload.single("image"),
  authonticationController.validateToken,
  studentController.updateStudent
);

app.post(
  "/addressUpdate/:userId",
  authonticationController.sValidateToken,
  studentController.addressUpdate
);

app.post(
  "/sendAddressUpdateReq",
  authonticationController.validateToken,
  studentController.sendAddressUpdateReq
);

app.get(
  "/studentDelete/:userId",
  authonticationController.validateToken,
  studentController.deleteStudent
);

app.post(
  "/moveStudents",
  authonticationController.validateToken,
  studentController.moveStudents
);

app.post(
  "/requestChange",
  authonticationController.sValidateToken,
  studentController.requestChange
);

app.post(
  "/requestChangeTu",
  upload.single("image"),
  authonticationController.sValidateToken,
  studentController.requestChangeTu
);

app.post(
  "/requestChangeEx",
  upload.single("image"),
  authonticationController.sValidateToken,
  studentController.requestChangeEx
);

app.post(
  "/approveAndReject",
  authonticationController.validateToken,
  studentController.approveAndReject
);

app.post(
  "/approveAndRejectTu",
  authonticationController.validateToken,
  studentController.approveAndRejectTu
);

app.post(
  "/approveAndRejectEx",
  authonticationController.validateToken,
  studentController.approveAndRejectEx
);

app.post(
  "/studentDownload",
  authonticationController.validateToken,
  studentController.studentDownload
);

app.post(
  "/studentTuitionDownload",
  authonticationController.validateToken,
  studentController.studentTuitionDownload
);

app.post(
  "/studentExamDownload",
  authonticationController.validateToken,
  studentController.studentExamDownload
);

app.post(
  "/studentAlumniDownload",
  authonticationController.validateToken,
  studentController.studentAlumniDownload
);

app.get("/getDetails", authonticationController.validateToken, studentController.getDetails);

app.post(
  "/insertManyStudents",
  authonticationController.validateToken,
  studentController.insertManyStudents
);

app.post(
  "/admissionApply",
  // authonticationController.validateToken,
  studentController.admissionApply
);

app.get(
  "/getStudentsList",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  studentController.getStudentsList
);

app.get(
  "/students/data",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  studentController.getStudentsData
);

app.get(
  "/mca/getSecondYearStudentsList",
  authonticationController.validateToken,
  studentController.getSecondYearStudentsListMCA
);

app.get(
  "/getStudentExamResults",
  authonticationController.sValidateToken,
  studentController.getStudentExamResults
);

app.get(
  "/getAcademicStudentsList", 
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  studentController.getAcademicStudentsList
);

app.get(
  "/students/academicRecords",
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  studentController.studentsAcademicRecords
)

app.get(
  "/getFirstYearStudentsForAcademic", 
  authonticationController.validateToken,
  studentController.getFirstYearStudentsForAcademic
);

app.get(
  "/getSecondYearStudentsForAcademic", 
  authonticationController.validateToken,
  studentController.getSecondYearStudentsForAcademic
);

app.get(
  "/examResults/:studentId", 
    authonticationController.validateToken,
    studentController.getStudentResults
);

app.post(
  "/examResults/add", 
    authonticationController.validateToken,
    studentController.addExamResult
);

app.post(
  "/examResults/update", 
    authonticationController.validateToken,
    studentController.updateExamResult
);

app.get(
  "/getSubjectCodes", 
    authonticationController.validateToken,
    studentController.getSubjectCodes
);

app.get("/addSubjectCode", async (req, res) => {
  try {
    const subjects = []      

    await subjectCodeModel.insertMany(subjects);
    res.send("Subjects inserted successfully");
    console.log("Subjects inserted successfully.");
  } catch (err) {
    console.log(err);
  }
});

app.get("/updateMany", async (req, res) => {
    try {
        const result = await Student.updateMany({}, { course: "MCA" });

        res.status(200).json({
            message: `${result.modifiedCount} students updated to MCA.`,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating students.",
            error: error.message,
            success: false
        });
    }
});

app.get(
  "/getJobsData",
  studentController.getJobsData
);

app.get(
  "/getJobPage",
  authonticationController.sValidateToken,
  studentController.renderJobPage
);

app.get(
  "/studentProfile",
  authonticationController.sValidateToken,
  studentController.getStudentDetails
);

app.get(
  "/alumni/studentProfile",
  authonticationController.sValidateToken,
  studentController.getAlumniStudentDetails
);

module.exports = app;

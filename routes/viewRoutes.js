const express = require("express");
const path = require("path");
const viewController = require("../controller/viewController");
// const studentController = require("../controller/studentController");
const cookieParser = require("cookie-parser");
const authonticationController = require("../middleware/auth");
const hbs = require("hbs");
const app = express();

app.use(cookieParser());

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

hbs.registerHelper("eq", function (v1, v2) {
  return v1 === v2;
});

app.use(express.static("images"));

app.use(express.static(path.join(__dirname, "../Images")));

app.get(
  "/getStudentRegister",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;

    req.body.course = course;
    next();
  },
  viewController.getStudentRegister
);

app.get(
  "/announcement",
  authonticationController.validateToken,
  viewController.announcement
);

app.get(
  "/studentProfileEdit/:userId",
  authonticationController.sValidateToken,
  viewController.studentProfileEdit
);

app.get(
  "/studentAddressUpdate/:userId",
  authonticationController.sValidateToken,
  viewController.studentAddressUpdate
);

app.get(
  "/addressUpdateReq",
  authonticationController.validateToken,
  viewController.addressUpdateReq
);

app.get(
  "/studentProfileTuEdit/:userId",
  authonticationController.sValidateToken,
  viewController.studentProfileTuEdit
);

app.get(
  "/studentProfileExEdit/:userId",
  authonticationController.sValidateToken,
  viewController.studentProfileExEdit
);

app.get(
  "/reviewRequest",
  authonticationController.validateToken,
  viewController.reviewRequest
);

app.get(
  "/reviewRequestTu",
  authonticationController.validateToken,
  viewController.reviewRequestTu
);

app.get(
  "/reviewRequestEx",
  authonticationController.validateToken,
  viewController.reviewRequestEx
);

app.get(
  "/paymentAlert",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  viewController.getPaymentAlert
);

app.get(
  "/commonAnnouncement",
  authonticationController.validateToken,
  viewController.commonAnnouncement
);

app.get(
  "/updateDueDatesForAll",
  authonticationController.validateToken,
  viewController.updateDueDatesForAll
);

app.get(
  "/messages",
  authonticationController.validateToken,
  viewController.message
);

app.get(
  "/studentList",
  authonticationController.validateToken,
  viewController.studentList
);

app.get(
  "/alumniList",
  authonticationController.validateToken,
  viewController.alumniList
);

app.get(
  "/staffList",
  authonticationController.validateToken,
  viewController.staffList
);

app.get(
  "/studentEdit/:userId",
  authonticationController.validateToken,
  viewController.studentEdit
);

app.get(
  "/staffEdit/:userId",
  authonticationController.validateToken,
  viewController.staffEdit
);

// app.get('/studentList/firstYear', viewController.firstYearStudentList);

// app.get('/studentList/secondYear', viewController.secondYearStudentList);

app.get("/getImageGallery", (req, res) => {
  res.render("uploadImageGallery");
});
app.get(
  "/dashboard",
  authonticationController.validateToken,
  viewController.dashboard
);

app.get(
  "/studentProfile",
  authonticationController.sValidateToken,
  viewController.getStudentDetails
);

app.get(
  "/feeRegister",
  authonticationController.validateToken,
  viewController.feeRegister
);

app.get("/sessionExpired", (req, res) => {
  res.render("sessionExpired");
});
app.get(
  "/feeList",
  authonticationController.validateToken,
  viewController.studentFeeList
);

app.get(
  "/subjectList",
  authonticationController.validateToken,
  viewController.subjectList
);

app.get(
  "/subject",
  authonticationController.validateToken,
  viewController.subject
);

app.get(
  "/moveStudentsPage",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  viewController.moveStudents
);

app.get(
  "/examFeeList",
  authonticationController.validateToken,
  viewController.examFeeList
);

app.get(
  "/feeEdit/:userId",
  authonticationController.validateToken,
  viewController.feeEdit
);

app.get(
  "/examFeeEdit/:userId",
  authonticationController.validateToken,
  viewController.examFeeEdit
);

// app.get(
//   "/image/gallery",
//   // authonticationController.validateToken,
//   viewController.gallery
// );

// app.get(
//   "/home/image/gallery",
//   // authonticationController.validateToken,
//   viewController.homeGallery
// );

app.get(
  "/imageList",
  // authonticationController.validateToken,
  viewController.imagesList
);

app.get(
  "/imageEdit/:imageId",
  authonticationController.validateToken,
  viewController.imageEdit
);

app.get("/student/forgotPassword", (req, res) => {
  res.render("studentForgotPassword")
})

// app.get('/downloadFirstYrTuFeePDF', viewController.downloadFirstYrTuFeePDF);

// app.get('/downloadSecondYrTuFeePDF', viewController.downloadSecondYrTuFeePDF);

// app.get('/downloadFirstYrExFeePDF', viewController.downloadFirstYrExFeePDF);

// app.get('/downloadSecondYrExFeePDF', viewController.downloadSecondYrExFeePDF);

app.post(
  "/alumniStatus",
  authonticationController.validateToken,
  viewController.alumniStatus
);

app.get(
  "/admissionForm",
  // authonticationController.validateToken,
  viewController.admissionForm
);

app.get(
  "/admissionFormList",
  authonticationController.validateToken,
  viewController.admissionFormList
);

app.get(
  "/tuitionCreatePayment",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  viewController.getTuitionCreatePayment
);

app.get(
  "/examCreatePayment",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  viewController.getExamCreatePayment
);

module.exports = app;

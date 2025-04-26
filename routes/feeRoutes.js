const express = require("express");
const authonticationController = require("../middleware/auth");
const app = express();
const path = require("path");
const feeController = require("../controller/feeController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

// app.post("/feeRegister", authonticationController.validateToken, feeController.newFee);

app.post(
  "/updateFee/:userId",
  authonticationController.validateToken,
  feeController.updateFee
);

app.post(
  "/updateExamFee/:userId",
  authonticationController.validateToken,
  feeController.updateExamFee
);

app.get(
  "/viewDueDatePage",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  feeController.viewDueDatePage
);

app.post(
  "/updateDueDate",
  authonticationController.validateToken,
  feeController.updateDueDate
);

app.get(
  "/getStudentsTuitionFeesList",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  feeController.getStudentsTuitionFeesList
);

// app.get(
//   "/getFirstYearTuitionFeesList",
//   authonticationController.validateToken,
//   feeController.getFirstYearTuitionFeesList
// );

// app.get(
//   "/getSecondYearTuitionFeesList",
//   authonticationController.validateToken,
//   feeController.getSecondYearTuitionFeesList
// );

app.get(
  "/getStudentsExamFeesList",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  feeController.getStudentsExamFeesList
);

app.get(
  "/students/fees/data",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;
    const type = req.query.type;

    req.body.course = course;
    req.body.year = year;
    req.body.type = type;
    next();
  },
  feeController.getStudentsFeesData
);

app.get(
  "/feesUpdateRequest/:studentId/:feeType",
  authonticationController.sValidateToken,
  feeController.feesUpdateRequest
);

app.post(
  "/submitFeeUpdateRequest",
  upload.single("image"),
  authonticationController.sValidateToken,
  feeController.submitFeeUpdateRequest
);

app.get(
  "/feesUpdateRequestList",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  feeController.feesUpdateRequestList
);

app.get(
  "/feesUpdateRequestListData",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  feeController.feesUpdateRequestListData
);

app.get(
  "/getStudentFeeUpdateReq",
  authonticationController.sValidateToken,
  (req, res, next) => {
    const studentId = req.query.studentId;

    req.body.studentId = studentId;
    next();
  },
  feeController.getStudentFeeUpdateReq
);

app.post(
  "/updateFeeRequestStatus",
  authonticationController.validateToken,
  feeController.updateFeeRequestStatus
);


// app.get(
//   "/getFirstYearExamFeesList",
//   authonticationController.validateToken,
//   feeController.getFirstYearExamFeesList
// );

// app.get(
//   "/getSecondYearExamFeesList",
//   authonticationController.validateToken,
//   feeController.getSecondYearExamFeesList
// );

// app.get("/deleteFee/:userId", authonticationController.validateToken, feeController.deleteFee);

module.exports = app;

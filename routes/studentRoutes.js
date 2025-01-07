const express = require("express");
const app = express();
const authonticationController = require("../middleware/auth");
const studentController = require("../controller/studentController");
const path = require("path");

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.post(
  "/studentRegister",
  authonticationController.validateToken,
  studentController.newStudent
);

app.post("/studentLogin", studentController.login);

app.post(
  "/student/forgotPassword",
  studentController.studentForgotPassword
);

app.post(
  "/student/forgotOtp",
  studentController.studentForgotOtp
);

app.post(
  "/studentUpdate/:userId",
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
  authonticationController.sValidateToken,
  studentController.requestChangeTu
);

app.post(
  "/requestChangeEx",
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

module.exports = app;

const express = require("express");
const path = require("path");
const viewController = require("../controller/viewController");
// const studentController = require("../controller/studentController");
const cookieParser = require("cookie-parser");
const authFile = require("../middleware/auth");
const app = express();

app.use(cookieParser());

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.use(express.static("images"));

app.use(express.static(path.join(__dirname, "../Images")));

app.get("/register", authFile.validateToken, viewController.register);

app.get("/announcement", authFile.validateToken, viewController.announcement);

app.get(
  "/firstYearAnnouncement",
  authFile.validateToken,
  viewController.firstYearAnnouncement
);

app.get(
  "/secondYearAnnouncement",
  authFile.validateToken,
  viewController.secondYearAnnouncement
);

app.get("/messages", authFile.validateToken, viewController.message);

app.get("/studentList", authFile.validateToken, viewController.studentList);

app.get(
  "/studentEdit/:userId",
  authFile.validateToken,
  viewController.studentEdit
);

// app.get('/studentList/firstYear', viewController.firstYearStudentList);

// app.get('/studentList/secondYear', viewController.secondYearStudentList);

app.get("/upload", (req, res) => {
  res.render("imageUpload");
});
app.get("/dashboard", authFile.validateToken, viewController.dashboard);

app.get("/studentProfile", authFile.sValidateToken, viewController.getStudentDetails);

app.get("/feeRegister", authFile.validateToken, viewController.feeRegister);

app.get("/sessionExpired", (req, res) => {
  res.render("sessionExpired");
});
app.get("/feeList", authFile.validateToken, viewController.studentFeeList);

app.get("/feeEdit/:userId", authFile.validateToken, viewController.feeEdit);

app.get("/gallery", authFile.validateToken, viewController.gallery);

module.exports = app;

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const loginController = require("../controller/loginController");
const studentController = require("../controller/studentController");
const authFile = require("../middleware/auth");
const authonticationController = require("../middleware/auth")
const app = express();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cookieParser());

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signin", (req, res) => {
  res.render("signin");
})

app.get("/forgotPassword", (req, res) => {
  res.render("forgotPassword");
});

app.get("/studentLogin", (req, res) => {
  res.render("studentLogin");
});

app.get("/staffRegistration", (req, res) => {
  res.render("staffRegistration");
});

app.post(
  "/staffRegister",
  authonticationController.validateToken,
  upload.single("image"),
  loginController.staffRegister
);

app.post("/login", loginController.login);

app.post("/verifyOtp", loginController.verifyOtp);

app.post("/resendOtp", loginController.resendOtp);

app.post("/resetPassword", loginController.resetPassword);

app.post("/staffUpdate/:userId",
  authonticationController.validateToken,
  upload.single("image"),
  loginController.staffUpdate
);

app.post("/staffDelete",
  authonticationController.validateToken,
  loginController.staffDelete
);

app.post("/forgotPassword", loginController.forgotPassword);

app.post("/forgotOtp", loginController.forgotOtp);

app.get("/logout", authFile.logout);

app.get("/slogout", authFile.slogout);

app.get(
  "/getUserRole",
  authonticationController.validateToken,
  (req, res, next) => {
    const userId = req.query.userId;

    req.body.userId = userId;
    next();
  },
  loginController.getUserRole
);

app.get(
  "/getStaffData",
  authonticationController.validateToken,
  loginController.getStaffData
);

app.post(
  "/staff/status",
  authonticationController.validateToken,
  loginController.updateStaffStatus
);

app.get('/staff/profile', 
  authonticationController.validateToken,
  loginController.getStaffProfilePage
);

app.get(
  "/staff/profile/data",
  authonticationController.validateToken,
  loginController.getStaffProfileData
);

app.get(
  "/staff/updateSalaryList",
  authonticationController.validateToken,
  loginController.updateEmpSalaryList
);

app.get(
  "/staff/salaryList",
  authonticationController.validateToken,
  loginController.getStaffSalartList
);

app.post(
  "/staff/staffBulkSalaryUpdate",
  authonticationController.validateToken,
  loginController.staffBulkSalaryUpdate
);

module.exports = app;

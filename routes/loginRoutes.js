const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const loginController = require("../controller/loginController");
const studentController = require("../controller/studentController");
const authFile = require("../middleware/auth");
const authonticationController = require("../middleware/auth")
const app = express();

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

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", loginController.signup);

app.post("/login", loginController.login);

app.post("/staffEdit/:userId",
  authonticationController.validateToken,
  loginController.staffEdit
);

app.get("/staffDelete/:userId",
  authonticationController.validateToken,
  loginController.staffDelete
);

app.post("/forgotPassword", loginController.forgotPassword);

app.post("/forgotOtp", loginController.forgotOtp);

app.post("/otp", loginController.otp);

app.get("/logout", authFile.logout);

app.get("/slogout", authFile.slogout);

module.exports = app;

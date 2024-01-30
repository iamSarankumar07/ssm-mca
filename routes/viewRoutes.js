const express = require("express");
const path = require("path");
const viewController = require("../controller/viewController");
const app = express();

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.use(express.static(path.join(__dirname, "../Images")));

app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/main", (req, res) => {
  res.render("main");
});
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/announcement", (req, res) => {
  res.render("announcement");
});
app.get("/firstYearAnnouncement", (req, res) => {
  res.render("firstYearAnnouncement");
});
app.get("/secondYearAnnouncement", (req, res) => {
  res.render("secondYearAnnouncement");
});
app.get("/messages", viewController.message);

app.get("/studentList", viewController.studentList);

app.get("/studentEdit/:userId", viewController.studentEdit);

// app.get('/studentList/firstYear', viewController.firstYearStudentList);

// app.get('/studentList/secondYear', viewController.secondYearStudentList);

app.get("/upload", (req, res)=>{
    res.render("imageUpload")
});
app.get("/dashboard", (req, res)=>{
    res.render("admin")
});
app.get("/feeRegister", (req, res) => {
  res.render("feeRegister");
});
app.get("/feeList", viewController.studentFeeList )

app.get("/feeEdit/:userId", viewController.feeEdit);

app.get("/gallery", viewController.gallery);

module.exports = app;

const express = require("express");
const app = express();
const studentController = require("../controller/studentController");

app.post("/studentRegister", studentController.newStudent);

app.post("/studentUpdate/:userId", studentController.updateStudent);

app.get("/studentDelete/:userId", studentController.deleteStudent);

module.exports = app;

const express = require("express");
const app = express();
const authFile = require('../middleware/auth')
const studentController = require("../controller/studentController");

app.post("/studentRegister", authFile.validateToken, studentController.newStudent);

app.post("/studentUpdate/:userId", authFile.validateToken, studentController.updateStudent);

app.get("/studentDelete/:userId", authFile.validateToken, studentController.deleteStudent);

module.exports = app;

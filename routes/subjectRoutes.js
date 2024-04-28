const express = require("express");
const authFile = require('../middleware/auth')
const app = express();

const subjectController = require("../controller/subjectController");

app.post("/subjectRegister", authFile.validateToken, subjectController.newSubject);

app.get("/deleteSubject/:userId", authFile.validateToken, subjectController.deleteSubject);

module.exports = app;
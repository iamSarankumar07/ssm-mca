const express = require("express");
const authonticationController = require("../middleware/auth");
const app = express();

const subjectController = require("../controller/subjectController");

app.post(
  "/subjectRegister",
  authonticationController.validateToken,
  subjectController.newSubject
);

app.get(
  "/deleteSubject/:userId",
  authonticationController.validateToken,
  subjectController.deleteSubject
);

module.exports = app;

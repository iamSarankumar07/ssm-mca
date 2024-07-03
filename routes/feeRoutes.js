const express = require("express");
const authonticationController = require("../middleware/auth");
const app = express();

const feeController = require("../controller/feeController");

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

app.post(
  "/updateDueDatesForAll",
  authonticationController.validateToken,
  feeController.updateDueDatesForAll
);

// app.get("/deleteFee/:userId", authonticationController.validateToken, feeController.deleteFee);

module.exports = app;

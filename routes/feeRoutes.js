const express = require("express");
const authFile = require('../middleware/auth')
const app = express();

const feeController = require("../controller/feeController");

// app.post("/feeRegister", authFile.validateToken, feeController.newFee);

app.post("/updateFee/:userId", authFile.validateToken, feeController.updateFee);

app.post("/updateExamFee/:userId", authFile.validateToken, feeController.updateExamFee);

app.post('/updateDueDatesForAll', authFile.validateToken, feeController.updateDueDatesForAll);

// app.get("/deleteFee/:userId", authFile.validateToken, feeController.deleteFee);

module.exports = app;

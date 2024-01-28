const express = require("express");
const app = express();
const feeController = require("../controller/feeController");

app.post("/feeRegister", feeController.newFee);

app.post("/updateFee/:userId", feeController.updateFee);

app.get("/deleteFee/:userId", feeController.deleteFee);

module.exports = app;
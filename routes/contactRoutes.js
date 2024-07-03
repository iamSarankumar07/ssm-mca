const express = require("express");
const app = express();
const contactController = require("../controller/contactController");

app.post("/userContact", contactController.contact);

module.exports = app;

const express = require("express");
const app = express();
const imageController = require('../controller/imageController')
const upload = require('../middleware/upload')

app.post("/upload", upload.single('image'), imageController.uploadImage);

module.exports = app;
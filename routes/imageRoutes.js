const express = require("express");
const app = express();
const imageController = require('../controller/imageController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/uploadImage", upload.single("image"), imageController.uploadImage);
app.get("/getImageFromFireBase", imageController.getImagesFromFireBase);
app.post("/uploadImageCloudinary", upload.single("image"), imageController.uploadImageCloudinary);
app.get('/getAllImagesFromCloudinary', imageController.getAllImagesFromCloudinary);
app.get("/getImageFromDB", imageController.getImagesFromDB);

module.exports = app;

const express = require("express");
const app = express();
const authonticationController = require("../middleware/auth");
const imageController = require("../controller/imageController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post(
  "/uploadImageFireBase",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.uploadImageFireBase
);

app.get(
  "/getImageFromFireBase",
  authonticationController.validateToken,
  imageController.getImagesFromFireBase
);

app.post(
  "/uploadImageCloudinary",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.uploadImageCloudinary
);

app.get(
  "/getAllImagesFromCloudinary",
  authonticationController.validateToken,
  imageController.getAllImagesFromCloudinary
);

app.post(
  "/uploadImageSupabase",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.uploadImageSupabase
);

// app.post("/getAllImagesFromSupabase", authonticationController.validateToken, imageController.getAllImagesFromSupabase);

app.get(
  "/getImageFromDB",
  authonticationController.validateToken,
  imageController.getImagesFromDB
);

module.exports = app;

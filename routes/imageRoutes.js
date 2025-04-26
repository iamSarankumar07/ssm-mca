const express = require("express");
const app = express();
const authonticationController = require("../middleware/auth");
const imageController = require("../controller/imageController");
const multer = require("multer");
const path = require("path");

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get(
  "/gallery",
  authonticationController.validateToken,
  imageController.gallery
);

app.get(
  "/home/gallery",
  imageController.homeGallery
);

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

app.post("/imageEdit/fireBase/:imageId",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.imageEditFirebase
);

app.post("/imageEdit/cloudinary/:imageId",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.imageEditCloudinary
);

app.get(
  "/imageDelete/:imageId",
  authonticationController.validateToken,
  imageController.imageDelete
);

app.get(
  "/fetch/Images/gallery",
  (req, res, next) => {
    const category = req.query.category;

    req.body.category = category;
    next();
  },
  imageController.fetchImagesForGallery
);

app.get(
  "/home/news",
  imageController.fetchNews
);

app.get(
  "/home/events",
  imageController.fetchEvents
);

app.get(
  "/newsAndEvents",
  authonticationController.validateToken,
  imageController.newsAndEvents
);

app.get(
  "/admin/getNews",
  authonticationController.validateToken,
  imageController.getAdminNews
);

app.get(
  "/admin/getEvents",
  authonticationController.validateToken,
  imageController.getAdminEvents
);

app.post(
  "/admin/upload-gallery",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.adminUploadGallery
);

app.post(
  "/admin/upload-news",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.adminUploadNews
);

app.post(
  "/admin/upload-event",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.adminUploadEvents
);

app.put(
  "/admin/updateNews/:id",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.adminUpdateNews
);
app.put(
  "/admin/updateEvents/:id",
  upload.single("image"),
  authonticationController.validateToken,
  imageController.adminUpdateEvents
);

module.exports = app;

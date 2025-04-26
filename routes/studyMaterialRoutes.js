const express = require("express");
const authonticationController = require("../middleware/auth");
const app = express();
const studyMaterialController = require("../controller/studyMaterialController");
const multer = require("multer");
const path = require("path");

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

const upload = multer({ dest: 'uploads/' });

app.get(
  "/getStudyMaterialUpload",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  studyMaterialController.getStudyMaterialUpload
);

app.post(
  "/uploadStudyMaterial",
  upload.single("pdf"),
  authonticationController.validateToken,
  studyMaterialController.uploadStudyMaterial
);

app.get(
  "/viewStudyMaterials",
  authonticationController.validateToken,
  (req, res, next) => {
    const course = req.query.course;
    const year = req.query.year;

    req.body.course = course;
    req.body.year = year;
    next();
  },
  studyMaterialController.viewStudyMaterials
);

app.get(
  "/getMaterial/:id",
  authonticationController.validateToken,
  studyMaterialController.getMaterialById
);

app.post(
  "/updateStudyMaterial",
  upload.single("pdf"),
  authonticationController.validateToken,
  studyMaterialController.updateStudyMaterial
);

app.post(
  "/subjectRegister",
  authonticationController.validateToken,
  studyMaterialController.newSubject
);

app.get(
  "/deleteSubject/:userId",
  authonticationController.validateToken,
  studyMaterialController.deleteSubject
);

module.exports = app;

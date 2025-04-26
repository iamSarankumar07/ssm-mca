const express = require("express");
const authenticationController = require("../middleware/auth");
const app = express();
const eCommerceController = require("../controller/eCommerceController");
const multer = require("multer");
const path = require("path");

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

const upload = multer({ dest: "uploads/" });

app.get(
    "/getProductManagement",
    authenticationController.validateToken,
    eCommerceController.getProductManagement
);

app.get(
    "/getOrders",
    authenticationController.validateToken,
    eCommerceController.getOrders
);

app.get(
    "/getBookStore",
    authenticationController.validateToken,
    eCommerceController.getBookStore
);

app.post(
  "/addProduct",
  upload.single("pdf"),
  authenticationController.validateToken,
  eCommerceController.addProduct
);

app.post(
    "/createOrder",
    eCommerceController.createOrder
);

// app.get(
//   "/viewOrders",
//   authonticationController.validateToken,
//   (req, res, next) => {
//     const course = req.query.course;
//     const year = req.query.year;

//     req.body.course = course;
//     req.body.year = year;
//     next();
//   },
//   eCommerceController.getStudyMaterialUpload
// );

module.exports = app
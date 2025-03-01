const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");

router.use(cookieParser());

router.use(require("./studentRoutes"));
router.use(require("./viewRoutes"));
router.use(require("./contactRoutes"));
router.use(require("./imageRoutes"));
router.use(require("./announcementRoutes"));
router.use(require("./feeRoutes"));
router.use(require("./loginRoutes"));
router.use(require("./subjectRoutes"));
router.use(require("./paymentRoutes"));
router.use(require("./advancePaymentRoutes"));
router.use(require("./attendanceRoutes"));
router.use(require("./chatRoutes"));
router.use(require("./chatbotRoutes"));

module.exports = router;

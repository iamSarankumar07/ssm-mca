const express = require("express");
const router = express.Router();

router.use(require("./studentRoutes"));
router.use(require("./viewRoutes"));
router.use(require("./contactRoutes"));
router.use(require("./imageRoutes"));
router.use(require("./announcementRoutes"));
router.use(require("./feeRoutes"));
router.use(require("./loginRoutes"));


module.exports = router;

const express = require("express");
const router = express.Router();

router.use(require("./studentRoutes"));
router.use(require("./viewRoutes"));
router.use(require("./contactRoutes"));
router.use(require("./imageRoutes"));
router.use(require("./announcementRoutes"));
router.use(require("./feeRoutes"));


module.exports = router;
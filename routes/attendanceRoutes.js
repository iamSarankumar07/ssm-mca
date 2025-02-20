const express = require("express");
const app = express();
const authonticationController = require("../middleware/auth");
const attendenceController = require("../controller/attendanceController");
const path = require("path");

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.get("/getFirstYearMarkAttendence",
    authonticationController.validateToken,
    attendenceController.getFirstYearMarkAttendence
);

app.get("/getSecondYearMarkAttendence",
    authonticationController.validateToken,
    attendenceController.getSecondYearMarkAttendence
);

app.post("/markAttendence", 
    authonticationController.validateToken,
    attendenceController.markAttendence
);

app.get("/getAttendenceReport", 
    authonticationController.validateToken,
    attendenceController.getAttendenceReport
);

module.exports = app;
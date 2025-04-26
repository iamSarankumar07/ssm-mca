const express = require("express");
const app = express();
const authonticationController = require("../middleware/auth");
const attendenceController = require("../controller/attendanceController");
const path = require("path");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

app.get("/getMarkAttendence",
    authonticationController.validateToken,
    (req, res, next) => {
        const course = req.query.course;
        const year = req.query.year;
        const date = req?.query?.date ? req?.query?.date : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];;
    
        req.body.course = course;
        req.body.year = year;
        req.body.date = date;
        next();
    },
    attendenceController.getMarkAttendence
);

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
    (req, res, next) => {
        const course = req.query.course;
        const year = req.query.year;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const isPdf = req.query.isPdf;
    
        req.body.course = course;
        req.body.year = year;
        req.body.startDate = startDate;
        req.body.endDate = endDate;
        req.body.isPdf = isPdf;
        next();
    },
    attendenceController.getAttendenceReport
);

app.post("/studentSelfAttendance",
    authonticationController.sValidateToken,
    attendenceController.studentSelfAttendance
);

app.get("/getStudentAttendanceStatus",
    authonticationController.sValidateToken,
    attendenceController.getStudentAttendanceStatus
);

app.get("/staff/getMarkAttendence",
    authonticationController.validateToken,
    (req, res, next) => {
        const course = req.query.course;
        const year = req.query.year;
        const date = req?.query?.date ? req?.query?.date : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];;
    
        req.body.course = course;
        req.body.year = year;
        req.body.date = date;
        next();
    },
    attendenceController.getStaffMarkAttendence
);

app.post("/staff/markAttendence", 
    authonticationController.validateToken,
    attendenceController.markStaffAttendence
);

app.get("/staff/getAttendenceReport", 
    authonticationController.validateToken,
    (req, res, next) => {
        const course = req.query.course;
        const year = req.query.year;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const isPdf = req.query.isPdf;
    
        req.body.course = course;
        req.body.year = year;
        req.body.startDate = startDate;
        req.body.endDate = endDate;
        req.body.isPdf = isPdf;
        next();
    },
    attendenceController.getStaffAttendenceReport
);

app.post("/staffSelfAttendance",
    authonticationController.validateToken,
    attendenceController.staffSelfAttendance
);

app.get("/getStaffAttendanceStatus",
    authonticationController.validateToken,
    attendenceController.getStaffAttendanceStatus
);

app.post(
    "/applyLeave",
    upload.single("image"),
    authonticationController.validateToken,
    attendenceController.applyLeave
);

app.get("/getAllLeaveRequests",
    authonticationController.validateToken,
    attendenceController.getAllLeaveRequests
);

app.post("/updateLeaveStatus",
    authonticationController.validateToken,
    attendenceController.updateLeaveStatus
);

app.get(
    "/staff/leaveHistory",
    authonticationController.validateToken,
    attendenceController.staffLeaveHistory
);

app.get(
    "/staff/viewLeaveRequest",
    authonticationController.validateToken,
    attendenceController.viewLeaveRequest
);

app.get(
    "/staff/leaveRequests",
    authonticationController.validateToken,
    attendenceController.leaveRequestData
);

module.exports = app;
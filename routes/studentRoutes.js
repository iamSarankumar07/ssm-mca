const express = require("express");
const app = express();
const authFile = require('../middleware/auth')
const studentController = require("../controller/studentController");

app.post("/studentRegister", authFile.validateToken, studentController.newStudent);

app.post("/studentUpdate/:userId", authFile.validateToken, studentController.updateStudent);

app.post("/addressUpdate/:userId", authFile.sValidateToken, studentController.addressUpdate);

app.post("/sendAddressUpdateReq", authFile.validateToken, studentController.sendAddressUpdateReq);

app.get("/studentDelete/:userId", authFile.validateToken, studentController.deleteStudent);

app.post("/moveStudents", authFile.validateToken, studentController.moveStudents);

app.post('/requestChange', studentController.requestChange);

app.post('/requestChangeTu', studentController.requestChangeTu);

app.post('/requestChangeEx', studentController.requestChangeEx);

app.post('/approveAndReject', studentController.approveAndReject);

app.post('/approveAndRejectTu', studentController.approveAndRejectTu);

app.post('/approveAndRejectEx', studentController.approveAndRejectEx);

app.post("/studentDownload", studentController.studentDownload);

app.post("/studentTuitionDownload", studentController.studentTuitionDownload);

app.post("/studentExamDownload", studentController.studentExamDownload);

app.post("/studentAlumniDownload", studentController.studentAlumniDownload);

app.get("/getDetails", studentController.getDetails)
app.post("/insertManyStudents", studentController.insertManyStudents)


module.exports = app;

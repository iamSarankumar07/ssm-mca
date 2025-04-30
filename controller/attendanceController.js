const StudentModel = require("../models/studentModel");
const AttendanceModel = require("../models/attendanceModel");
const pdf = require("html-pdf");
const moment = require("moment");
const TemplateModel = require("../models/templateModel");
const staffAttendanceModel = require("../models/staffAttendanceModel");
const staffModel = require("../models/adminModel");
const leaveRequestModel = require('../models/leaveRequestModel');

exports.getMarkAttendence = async (req, res) => {
  let body = req.body;
  let year = body.year;
  let course = body.course;
  let date = body.date;
  try {
    let students = await StudentModel.find({ isDelete: false, year: year, course: course });

    students = students.sort((a, b) => a.name.localeCompare(b.name));

    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

    const studentIds = students.map(s => s._id);

    const records = await AttendanceModel.find({ 
      studentId: { $in: studentIds },
      date: date
    });

    const attendanceMap = {};

    records.forEach(record => {
      attendanceMap[record.studentId.toString()] = record.status;
    });

    res.render("markAttendance", { students, date, year: year, attendanceMap, course: course });
  } catch (err) {
    return res.status(404).render('error', { message: "Unable to fetch students fees list! please try again later." });
  }
};

exports.getFirstYearMarkAttendence = async (req, res) => {
  try {
    let students = await StudentModel.find({ isDelete: false, year: "I" });

    students = students.sort((a, b) => a.name.localeCompare(b.name));

    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

    const studentIds = students.map(s => s._id);

    const records = await AttendanceModel.find({ 
      studentId: { $in: studentIds },
      date: today
    });

    const attendanceMap = {};

    records.forEach(record => {
      attendanceMap[record.studentId.toString()] = record.status;
    });

    res.render("markAttendance", { students, today, year: "I", attendanceMap });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getSecondYearMarkAttendence = async (req, res) => {
  try {
    let students = await StudentModel.find({ isDelete: false, year: "II" });

    students = students.sort((a, b) => a.name.localeCompare(b.name));

    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

    const studentIds = students.map(s => s._id);

    const records = await AttendanceModel.find({
      studentId: { $in: studentIds },
      date: today
    });

    const attendanceMap = {};

    records.forEach(record => {
      attendanceMap[record.studentId.toString()] = record.status;
    });

    res.render("markAttendance", { students, today, year: "II", attendanceMap });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.markAttendence = async (req, res) => {
  try {
    const { date, attendance, year } = req.body;

    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

    // if (date !== today) {
    //   return res.status(400).send("You can only edit today's attendance.");
    // }

    const bulkOperations = [];

    for (const studentId in attendance) {
      bulkOperations.push({
        updateOne: {
          filter: { studentId: studentId, date: date },
          update: { $set: { status: attendance[studentId] } },
          upsert: true
        }
      });
    }
    if (bulkOperations.length > 0) {
      await AttendanceModel.bulkWrite(bulkOperations);
    }

    res.status(200).json({
      success: true,
      message: "Attendance submitted successfully!"
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.getAttendenceReport = async (req, res) => {
  try {
    let { specificDate, startDate, endDate, year, isPdf, course } = req.body;
    
    if (specificDate) {
      startDate = specificDate;
      endDate = specificDate;
    }
    
    if (!startDate || !endDate) {
      startDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
      endDate = startDate;
    }

    const studentFilter = { isDelete: false, isAlumni: false };

    if (year) {
      studentFilter.year = year;
    }

    const students = await StudentModel.find(studentFilter, { name: 1, gender: 1, studentId: 1});
    const studentIds = students.map(s => s._id);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    const summary = await AttendanceModel.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: "$studentId",
          totalPresent: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          totalLate: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          totalExcused: { $sum: { $cond: [{ $eq: ["$status", "excused"] }, 1, 0] } }
        }
      }
    ]);

    const report = summary.map(item => {
      const student = students.find(s => s._id.toString() === item._id.toString());
      return {
        studentId: item._id,
        name: student ? student.name : "Unknown",
        gender: student.gender,
        stdId: student.studentId,
        course: course,
        totalPresent: item.totalPresent,
        totalAbsent: item.totalAbsent,
        totalLate: item.totalLate,
        totalExcused: item.totalExcused
      };
    });

    report.sort((a, b) => a.name.localeCompare(b.name));

    if (isPdf === "true") {
      let templateData = {
        report: report,
        startDate: moment(startDate).format("DD-MM-YYYY"),
        endDate: moment(endDate).format("DD-MM-YYYY"),
        course: course,
        year: year,
      }

      let dbTemplate = await TemplateModel.findOne({ name: "ATTENDANCE_REPORT_PDF" });
      let attachment = eval("`" + dbTemplate.content + "`");

      pdf
        .create(attachment, {
          childProcessOptions: { env: { OPENSSL_CONF: "/dev/null" } },
          orientation: "portrait",
          width: "8.27in",
          height: "11.69in",
          timeout: "100000",
        })
        .toBuffer((err, buffer) => {
          if (err) {
            console.log("Error: " + err);
            return res
              .status(500)
              .send({ success: false, message: err.message });
          }
          res.writeHead(200, {
            "Content-Length": Buffer.byteLength(buffer),
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename = ${course} - ${year} Attendance Report.pdf`,
          });
          res.end(buffer);
        });
    } else {
      res.render("attendanceReport", { report, startDate, endDate, year: year || "", specificDate, course: course });
    }

  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  let toRad = (value) => (value * Math.PI) / 180;
  let R = 6371;
  let dLat = toRad(lat2 - lat1);
  let dLon = toRad(lon2 - lon1);
  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.studentSelfAttendance = async (req, res) => {
  try {
      const { latitude, longitude } = req.body;
      if (!latitude || !longitude) {
        
        return res.status(400).json({ success: false, message: "Invalid location data." });
      }

      // const collegeLocation = { latitude: 17.4291935, longitude: 78.4595755 };
      // const collegeLocation = { latitude: latitude, longitude: longitude };

      const collegeLocation = { latitude: 17.4291935, longitude: 78.4595755 };
      const radius = 0.5;

      let studentId = req.student._id;
      let todayDate = new Date().toISOString().split("T")[0];

      let distance = getDistance(collegeLocation.latitude, collegeLocation.longitude, latitude, longitude);

      if (distance > radius) {
          return res.status(403).json({ success: false, message: "You are outside the college premises." });
      }

      let status = "present";
      const attendanceDeadline = new Date();
      attendanceDeadline.setHours(10, 30, 0, 0);

      let now = new Date();
      
      if (now > attendanceDeadline) {
        status = "late";
      }

      let isAttendanceExists = await AttendanceModel.findOne({studentId: studentId});

      if (isAttendanceExists) {
        await AttendanceModel.updateOne(
            { studentId, date: todayDate },
            { $set: { status: status } },
            { upsert: true }
        );
      } else {
        await AttendanceModel.create({
            studentId: studentId,
            date: todayDate,
            status: status
        });
      }

      res.status(200).json({ success: true, message: "Attendance marked successfully." });

  } catch (err) {
      console.error("Error in studentSelfAttendance:", err);
      res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

exports.getStudentAttendanceStatus = async (req, res) => {
  try {
    const studentId = req.student._id;
    const today = new Date().toISOString().split("T")[0];

    const record = await AttendanceModel.findOne({ studentId, date: today });

    res.status(200).json({ attendanceMarked: !!record });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

exports.getStaffMarkAttendence = async (req, res) => {
  let body = req.body;
  let year = body.year;
  let course = body.course;
  let date = body.date;
  try {
    let staffs = await staffModel.find({ isDelete: false, isFaculty: true });

    staffs = staffs.sort((a, b) => a.name.localeCompare(b.name));

    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

    const studentIds = staffs.map(s => s._id);

    const records = await staffAttendanceModel.find({ 
      staffId: { $in: studentIds },
      date: date
    });

    const attendanceMap = {};

    records.forEach(record => {
      attendanceMap[record.studentId.toString()] = record.status;
    });

    res.render("markAttendance", { staffs, date, year: year, attendanceMap, course: course });
  } catch (err) {
    return res.status(404).render('error', { message: "Internal Server Error!" });
  }
};

exports.markStaffAttendence = async (req, res) => {
  try {
    const { date, attendance, year } = req.body;

    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];

    // if (date !== today) {
    //   return res.status(400).send("You can only edit today's attendance.");
    // }

    const bulkOperations = [];

    for (const studentId in attendance) {
      bulkOperations.push({
        updateOne: {
          filter: { studentId: studentId, date: date },
          update: { $set: { status: attendance[studentId] } },
          upsert: true
        }
      });
    }
    if (bulkOperations.length > 0) {
      await staffAttendanceModel.bulkWrite(bulkOperations);
    }

    res.status(200).json({
      success: true,
      message: "Attendance submitted successfully!"
    });
  } catch (err) {
    res.status(200).json({
      success: false,
      message: "Internal Server Error!"
    });
  }
};

exports.getStaffAttendenceReport = async (req, res) => {
  try {
    let { specificDate, startDate, endDate, year, isPdf, course } = req.body;
    
    if (specificDate) {
      startDate = specificDate;
      endDate = specificDate;
    }
    
    if (!startDate || !endDate) {
      startDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
      endDate = startDate;
    }

    const studentFilter = { isDelete: false, isAlumni: false };

    if (year) {
      studentFilter.year = year;
    }

    const students = await StudentModel.find(studentFilter, { name: 1, gender: 1, studentId: 1});
    const studentIds = students.map(s => s._id);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    const summary = await staffAttendanceModel.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: "$studentId",
          totalPresent: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          totalLate: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
          totalExcused: { $sum: { $cond: [{ $eq: ["$status", "excused"] }, 1, 0] } }
        }
      }
    ]);

    const report = summary.map(item => {
      const student = students.find(s => s._id.toString() === item._id.toString());
      return {
        studentId: item._id,
        name: student ? student.name : "Unknown",
        gender: student.gender,
        stdId: student.studentId,
        course: course,
        totalPresent: item.totalPresent,
        totalAbsent: item.totalAbsent,
        totalLate: item.totalLate,
        totalExcused: item.totalExcused
      };
    });

    report.sort((a, b) => a.name.localeCompare(b.name));

    if (isPdf === "true") {
      let templateData = {
        report: report,
        startDate: moment(startDate).format("DD-MM-YYYY"),
        endDate: moment(endDate).format("DD-MM-YYYY"),
        course: course,
        year: year,
      }

      let dbTemplate = await TemplateModel.findOne({ name: "ATTENDANCE_REPORT_PDF" });
      let attachment = eval("`" + dbTemplate.content + "`");

      pdf
        .create(attachment, {
          childProcessOptions: { env: { OPENSSL_CONF: "/dev/null" } },
          orientation: "portrait",
          width: "8.27in",
          height: "11.69in",
          timeout: "100000",
        })
        .toBuffer((err, buffer) => {
          if (err) {
            console.log("Error: " + err);
            return res
              .status(500)
              .send({ success: false, message: err.message });
          }
          res.writeHead(200, {
            "Content-Length": Buffer.byteLength(buffer),
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename = ${course} - ${year} Attendance Report.pdf`,
          });
          res.end(buffer);
        });
    } else {
      res.render("attendanceReport", { report, startDate, endDate, year: year || "", specificDate, course: course });
    }

  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.staffSelfAttendance = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Invalid location data." });
    }
    
    const collegeLocation = { latitude: 17.4291935, longitude: 78.4595755 };
    const radius = 0.5;
    
    let staffId = req.user.id;
    let now = new Date();
    let todayDate = now.toISOString().split("T")[0];
    
    let distance = getDistance(collegeLocation.latitude, collegeLocation.longitude, latitude, longitude);
    
    if (distance > radius) {
      return res.status(403).json({ success: false, message: "You are outside the college premises." });
    }
    
    let status = "present";
    const attendanceDeadline = new Date();
    attendanceDeadline.setHours(10, 30, 0, 0);
    
    if (now > attendanceDeadline) {
      status = "late";
    }
    
    let isAttendanceExists = await staffAttendanceModel.findOne({ staffId });
    
    let updatedDoc;
    
    if (isAttendanceExists) {
      updatedDoc = await staffAttendanceModel.updateOne(
        { staffId, date: todayDate },
        { $set: { status: status } },
        { upsert: true }
      );
    } else {
      updatedDoc = await staffAttendanceModel.create({
        staffId: staffId,
        date: todayDate,
        status: status
      });
    }

    res.status(200).json({ success: true, message: "Attendance marked successfully." });

  } catch (err) {
      console.error("Error in staffSelfAttendance:", err);
      res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
};

exports.getStaffAttendanceStatus = async (req, res) => {
  try {
    const staffId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const record = await staffAttendanceModel.findOne({ staffId, date: today });

    res.status(200).json({ attendanceMarked: !!record });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

exports.carryForwardLeaves = async (staffId) => {
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);

  let staff = await staffModel.findById(staffId);

  if (staff.lastLeaveCarryForward && staff.lastLeaveCarryForward >= yearStart) {
    return;
  } else {
    let unusedCasual = staff.leaveBalance.casualTotal - staff.leaveBalance.casual;
    let unusedSick = staff.leaveBalance.sickTotal - staff.leaveBalance.sick;

    let totalCarryForward = Math.max(unusedCasual, 0) + Math.max(unusedSick, 0);

    staff.leaveBalance.earnedTotal += totalCarryForward;

    staff.leaveBalance.casual = 0;
    staff.leaveBalance.sick = 0;

    staff.lastLeaveCarryForward = today;

    await staff.save();
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const uploadToCloudinary = (fileBuffer, fileName) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: fileName,
            resource_type: "auto",
            folder: "Leave Request",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject("Error uploading file to Cloudinary.");
            }
            resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });
    };

    let cloudinaryResult;
    if (req.file) {
      let fileName = req.file.originalname ? req.file.originalname : "";
      cloudinaryResult = await uploadToCloudinary(req.file.buffer, fileName);
    }

    const leave = new leaveRequestModel({
      staffId: req.user.id,
      type: leaveType,
      startDate,
      endDate,
      reason,
      attachment: cloudinaryResult?.secure_url ? cloudinaryResult?.secure_url : '',
    });

    await leave.save();
    res.status(200).json({ success: true, message: 'Leave request submitted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error applying leave' });
  }
};

exports.getAllLeaveRequests = async (req, res) => {
  const requests = await leaveRequestModel.find({ status: "Pending" }).populate('staffId').sort({ appliedOn: -1 });
  res.json(requests);
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    let { status, adminComment, leaveId } = req.body;

    let leave = await leaveRequestModel.findById(leaveId).populate('staffId');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    if (status === 'Approved') {
      let start = new Date(leave.startDate);
      let end = new Date(leave.endDate);
      let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      let leaveTypeKey = leave.type.toLowerCase();
      leave.staffId.leaveBalance[leaveTypeKey] -= days;
      // if (leaveTypeKey !== "earned") leave.staffId.leaveBalance.earned -= days;
      await leave.staffId.save();
    }

    leave.status = status;
    leave.adminComment = adminComment || '';
    await leave.save();

    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully.` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal Server error' });
  }
};

exports.staffLeaveHistory = async (req, res) => {
  try {
    const staffId = req.user.id;

    const leaveHistory = await leaveRequestModel.find({ staffId }).sort({ appliedOn: -1 });

    res.status(200).json({ success: true, data: leaveHistory });

  } catch (err) {
    console.error('Error fetching leave history:', err);
    res.status(500).json({ success: false, message: 'Internal Server error' });
  }
};

exports.viewLeaveRequest = async (req, res) => {
  try {

    const leaveHistory = await leaveRequestModel.find().sort({ appliedOn: -1 });

    res.render("leaveRequest");

  } catch (err) {
    console.log('Error fetching leave history:', err);
    return res.status(404).render('error', { message: "Internal Server Error!" });
  }
};

exports.leaveRequestData = async (req, res) => {
  try {

    const leaveHistory = await leaveRequestModel.find().populate('staffId').sort({ appliedOn: -1 });

    res.status(200).json({ success: true, data: leaveHistory });

  } catch (err) {
    console.error('Error fetching leave history:', err);
    res.status(500).json({ success: false, message: 'Internal Server error' });
  }
};

module.exports = exports;
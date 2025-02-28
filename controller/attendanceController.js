const StudentModel = require("../models/studentModel");
const AttendanceModel = require("../models/attendanceModel")

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

    if (date !== today) {
      return res.status(400).send("You can only edit today's attendance.");
    }

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

    res.send(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
    
        .modal {
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.6);
        }
    
        .modal-content {
          background-color: #fefefe;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 10px;
          width: 80%;
          max-width: 400px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
    
        p {
          margin: 0 0 20px;
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
          text-align: center;
        }
    
        .button-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }
    
        button[type="button"] {
          background-color: #3d6ef5ff;
          color: #f2f2f2;
          font-weight: bold;
          padding: 8px 14px;
          border: none;
          font-size: 13px;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
    
        button[type="button"]:hover {
          background-color: #f2f2f2;
          color: #3d6ef5ff;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div id="myModal" class="modal">
        <div class="modal-content">
          <p>Attendance Updated Successfully!</p>
          <div class="button-container">
            <button type="button" onclick="redirect()">Continue</button>
          </div>
        </div>
      </div>
    
      <script>
        function redirect() {
          window.location.href = "/ssm/mca/dashboard#students";
        }
    
        window.onload = function() {
          var modal = document.getElementById("myModal");
    
          modal.style.display = "flex";
    
          window.onclick = function(event) {
            if (event.target == modal) {
              modal.style.display = "none";
              redirect();
            }
          }
        }
      </script>
    </body>
    </html>
    
    `
   );
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.getAttendenceReport = async (req, res) => {
  try {
    let { specificDate, startDate, endDate, year } = req.query;
    
    if (specificDate) {
      startDate = specificDate;
      endDate = specificDate;
    }
    
    if (!startDate || !endDate) {
      startDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
      endDate = startDate;
    }

    const studentFilter = { isDelete: false };

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
        totalPresent: item.totalPresent,
        totalAbsent: item.totalAbsent,
        totalLate: item.totalLate,
        totalExcused: item.totalExcused
      };
    });

    report.sort((a, b) => a.name.localeCompare(b.name));

    res.render("attendanceReport", { report, startDate, endDate, year: year || "", specificDate });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

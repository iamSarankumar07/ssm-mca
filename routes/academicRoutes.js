const express = require("express");
const app = express();
const path = require("path");
const authonticationController = require("../middleware/auth");
const academicController = require("../controller/academicController");

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

// app.get("/getFirstYearStudentsForAcademic", 
//     authonticationController.validateToken,
//     academicController.getFirstYearStudentsForAcademic
// );

// app.get("/getSecondYearStudentsForAcademic", 
//     authonticationController.validateToken,
//     academicController.getSecondYearStudentsForAcademic
// );

// app.get("/examResults/:studentId", 
//     authonticationController.validateToken,
//     academicController.getStudentResults
// );

// app.post("/examResults/add", 
//     authonticationController.validateToken,
//     academicController.addExamResult
// );

// app.post("/examResults/update", 
//     authonticationController.validateToken,
//     academicController.updateExamResult
// );

// app.get("/getSubjectCodes", 
//     authonticationController.validateToken,
//     academicController.getSubjectCodes
// );

// app.get("/addSubjectCode", async (req, res) => {
//   try {
//     const subjects = []      

//     await subjectCodeModel.insertMany(subjects);
//     res.send("Subjects inserted successfully");
//     console.log("Subjects inserted successfully.");
//   } catch (err) {
//     console.log(err);
//   }
// });

// app.get("/updateMany", async (req, res) => {
//     try {
//         const result = await Student.updateMany({}, { course: "MCA" });

//         res.status(200).json({
//             message: `${result.modifiedCount} students updated to MCA.`,
//             success: true
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Error updating students.",
//             error: error.message,
//             success: false
//         });
//     }
// });

module.exports = app;
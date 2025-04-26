const mongoose = require("mongoose");
const StudentModel = require("../models/studentModel");
const subjectCodeModel = require("../models/subjectCodeModel");

exports.getFirstYearStudentsForAcademic = async (req, res) => {
    try {
        const studentsData = await StudentModel.find({ year: "I", isDelete: false, isAlumni: false }).lean();

        async function getSubjectNames(examResults) {
            const subjectCodes = examResults.map(result => result.subjectCode);
            const subjects = await subjectCodeModel.find({ subjectCode: { $in: subjectCodes } }).lean();

            const subjectMap = {};
            subjects.forEach(subject => {
                subjectMap[subject.subjectCode] = subject.subjectName;
            });

            return examResults.map(result => ({
                ...result,
                subjectName: subjectMap[result.subjectCode] || "Unknown Subject"
            }));
        }

        async function groupBySemester(examResults) {
            const resultsWithNames = await getSubjectNames(examResults);
            return resultsWithNames.reduce((acc, result) => {
                acc[result.semester] = acc[result.semester] || [];
                acc[result.semester].push(result);
                return acc;
            }, {});
        }

        for (const student of studentsData) {
            student.groupedExamResults = await groupBySemester(student.examResults || []);
        }

        let studentsCount = studentsData.length;
        res.render("academicStudentList", { 
            studentsData, 
            message: null, 
            error: null, 
            year: "I", 
            studentsCount 
        });

    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).render("academicStudentList", { 
            studentsData: [], 
            message: null, 
            error: "Error fetching students.", 
            year: "I", 
            studentsCount: 0 
        });
    }
};

exports.getSecondYearStudentsForAcademic = async (req, res) => {
    try {
        const studentsData = await StudentModel.find({ year: "II", isDelete: false, isAlumni: false }).lean();

        async function getSubjectNames(examResults) {
            const subjectCodes = examResults.map(result => result.subjectCode);
            const subjects = await subjectCodeModel.find({ subjectCode: { $in: subjectCodes } }).lean();

            const subjectMap = {};
            subjects.forEach(subject => {
                subjectMap[subject.subjectCode] = subject.subjectName;
            });

            return examResults.map(result => ({
                ...result,
                subjectName: subjectMap[result.subjectCode] || "Unknown Subject"
            }));
        }

        async function groupBySemester(examResults) {
            const resultsWithNames = await getSubjectNames(examResults);
            return resultsWithNames.reduce((acc, result) => {
                acc[result.semester] = acc[result.semester] || [];
                acc[result.semester].push(result);
                return acc;
            }, {});
        }

        for (const student of studentsData) {
            student.groupedExamResults = await groupBySemester(student.examResults || []);
        }

        let studentsCount = studentsData.length;
        res.render("academicStudentList", { 
            studentsData, 
            message: null, 
            error: null, 
            year: "II", 
            studentsCount 
        });
    } catch (error) {
        res.status(500).render("academicStudentList", { students: [], message: null, error: "Error fetching students.", year: "II", studentsCount: 0 });
    }
};

exports.getStudentResults = async (req, res) => {
    try {
        const student = await StudentModel.findById(req.params.studentId);
        if (!student) {
            return res.status(404).render("academicResults", { student: null, message: null, error: "Student not found." });
        }
        res.render("academicResults", { student, message: null, error: null });
    } catch (error) {
        res.status(500).render("academicResults", { student: null, message: null, error: "Error fetching results." });
    }
};

exports.addExamResult = async (req, res) => {
    try {
        const { studentId, semester, subjectCode, subjectName, grade, result } = req.body;
        await StudentModel.findByIdAndUpdate(studentId, {
            $push: { examResults: { _id: new mongoose.Types.ObjectId(), semester, subjectCode, subjectName, grade, result } }
        });
        res.json({ success: true, message: "Exam result added successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add exam result." });
    }
};

exports.updateExamResult = async (req, res) => {
    try {
        const { studentId, resultId, semester, subjectCode, grade, result } = req.body;
        await StudentModel.updateOne(
            { _id: studentId, "examResults._id": resultId },
            { $set: { "examResults.$.semester": semester, "examResults.$.subjectCode": subjectCode, "examResults.$.grade": grade, "examResults.$.result": result } }
        );
        res.json({ success: true, message: "Exam result updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update exam result." });
    }
};

exports.getSubjectCodes = async (req, res) => {
    try {
        const subjects = await subjectCodeModel.find({}, 'subjectCode subjectName').lean();
        res.json({ success: true, subjects });
    } catch (err) {
        console.error("Error fetching subjects:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = exports;
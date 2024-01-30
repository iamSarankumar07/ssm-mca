const express = require("express");
const path = require("path");
const Contact = require("../models/contactModel");
const Student = require("../models/studentModel");
const studentFee = require("../models/feesModel");
const Image = require("../models/imageModel");
const app = express();
app.use(express.static(path.join(__dirname, "../Images")));

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

exports.dashboard = async (req, res) => {
  res.render("admin");
};

exports.register = async (req, res) => {
  res.render("register");
};

exports.announcement = async (req, res) => {
  res.render("announcement");
};

exports.firstYearAnnouncement = async (req, res) => {
  res.render("firstYearAnnouncement");
};

exports.secondYearAnnouncement = async (req, res) => {
  res.render("secondYearAnnouncement");
};

exports.feeRegister = async (req, res) => {
  res.render("feeRegister");
};

exports.message = async (req, res) => {
  try {
    const messages = await Contact.find();
    res.render("message", { messages });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

exports.studentList = async (req, res) => {
  try {
    const allStudents = await Student.find({ isDelete: false });
    const firstYearStudents = allStudents.filter(
      (student) => student.year === 1
    );
    const secondYearStudents = allStudents.filter(
      (student) => student.year === 2
    );

    res.render("studentList", { firstYearStudents, secondYearStudents });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

// exports.studentList = async (req, res) => {
//   try {
//     const students = await Student.find({ isDelete: false });

//     res.render("studentList", { students });
//   } catch (err) {
//     console.error(err);
//     res.send("Error", err);
//   }
// };

// exports.firstYearStudentList = async (req, res) => {
//   try {
//     const firstYearStudents = await Student.find({ year: 1, isDelete: false });
//     res.render("studentList", { students: firstYearStudents });
//   } catch (err) {
//     console.error(err);
//     res.send("Error", err);
//   }
// };

// exports.secondYearStudentList = async (req, res) => {
//   try {
//     const secondYearStudents = await Student.find({ year: 2, isDelete: false });
//     res.render("studentList", { students: secondYearStudents });
//   } catch (err) {
//     console.error(err);
//     res.send("Error", err);
//   }
// };

exports.studentEdit = async (req, res) => {
  try {
    const userId = req.params.userId;
    const student = await Student.findById(userId);
    res.render("studentEdit", { student });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.studentFeeList = async (req, res) => {
  try {
    const allStudents = await studentFee.find({ isDelete: false });
    const firstYearStudents = allStudents.filter(
      (student) => student.year === 1
    );
    const secondYearStudents = allStudents.filter(
      (student) => student.year === 2
    );

    res.render("studentFeeList", { firstYearStudents, secondYearStudents });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.feeEdit = async (req, res) => {
  try {
    const userId = req.params.userId;
    const fee = await studentFee.findById(userId);
    res.render("feeEdit", { fee });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.gallery = async (req, res) => {
  try {
    const images = await Image.find({});
    res.render("gallery", { images });
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
};

module.exports = exports;

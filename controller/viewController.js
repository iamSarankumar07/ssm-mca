const express = require("express");
const path = require("path");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const pdf = require('html-pdf');
const Contact = require("../models/contactModel");
const Student = require("../models/studentModel");
const studentFee = require("../models/feesModel");
const authFile = require("../middleware/auth");
const Image = require("../models/imageModel");
const app = express();
const { verify } = require("jsonwebtoken");
app.use(express.static(path.join(__dirname, "../Images")));

app.use(express.static("Images"));

const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.set("view engine", "hbs");
const viewPath = path.join(__dirname, "../view");
app.set("views", viewPath);

exports.dashboard = async (req, res) => {
  res.render("admin");
};

exports.studentProfile = async (req, res) => {
  res.render("studentProfile");
};

exports.register = async (req, res) => {
  res.render("register");
};

exports.announcement = async (req, res) => {
  res.render("announcement");
};

exports.commonAnnouncement = async (req, res) => {
  res.render("commonAnnouncement");
};

exports.paymentAlert = async (req, res) => {
  res.render("paymentAlert");
};

exports.updateDueDatesForAll = async (req, res) => {
  res.render("dueDate");
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
      (student) => student.year === "I"
    );
    const secondYearStudents = allStudents.filter(
      (student) => student.year === "II"
    );

    res.render("studentList", { firstYearStudents, secondYearStudents });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

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
    const allStudents = await Student.find({ isDelete: false });
    const firstYearStudents = allStudents.filter(
      (student) => student.year === "I"
    );
    const secondYearStudents = allStudents.filter(
      (student) => student.year === "II"
    );

    res.render("studentFeeList", { firstYearStudents, secondYearStudents });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.examFeeList = async (req, res) => {
  try {
    const allStudents = await Student.find({ isDelete: false });
    const firstYearStudents = allStudents.filter(
      (student) => student.year === "I"
    );
    const secondYearStudents = allStudents.filter(
      (student) => student.year === "II"
    );

    res.render("examFeeList", { firstYearStudents, secondYearStudents });
  } catch (err) {
    console.error(err);
    res.send("Error", err);
  }
};

exports.examFeeEdit = async (req, res) => {
  try {
    const userId = req.params.userId;
    const fee = await Student.findById(userId);
    res.render("examFeeEdit", { fee });
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.feeEdit = async (req, res) => {
  try {
    const userId = req.params.userId;
    const fee = await Student.findById(userId);
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

exports.getStudentDetails = async (req, res) => {
  const accessToken = req.cookies["access-token"];
  try {
    const decodedToken = await verify(
      accessToken,
      "mnbvcxzlkjhgfdsapoiuytrewq"
    );
    const studentId = decodedToken.studentId;

    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.send(
        '<script>alert("Student not Found!"); window.location.href = "/ssm/mca/studentLogin";</script>'
      );
    }

    res.render("studentProfile", { student });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).send("Failed to fetch user details");
  }
};

exports.downloadFirstYrTuFeePDF = async (req, res) => {
    try {
      const firstYearStudents = await Student.find({ year: 'I', isDelete: false });
  
      res.render('firstYearTuitionFeeTemplate', { firstYearStudents }, async (err, html) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error rendering template');
        }
  
        const options = {
          format: 'A4', 
        };
  
        pdf.create(html, options).toFile('./temp/firstYearFeeList.pdf', (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error creating PDF');
          }
  
          res.download('./temp/firstYearFeeList.pdf', 'I MCA Tuition Fees Details.pdf', (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Error downloading PDF');
            }
  
            fs.unlinkSync('./temp/firstYearFeeList.pdf');
          });
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
};

exports.downloadSecondYrTuFeePDF = async (req, res) => {
    try {
      const secondYearStudents = await Student.find({ year: 'II', isDelete: false });
  
      res.render('secondYearTuitionFeeTemplate', { secondYearStudents }, async (err, html) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error rendering template');
        }
  
        const options = {
          format: 'A4', 
        };
  
        pdf.create(html, options).toFile('./temp/firstYearFeeList.pdf', (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error creating PDF');
          }
  
          res.download('./temp/firstYearFeeList.pdf', 'II MCA Tuition Fees Details.pdf', (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Error downloading PDF');
            }
  
            fs.unlinkSync('./temp/firstYearFeeList.pdf');
          });
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
};

exports.downloadFirstYrExFeePDF = async (req, res) => {
    try {
      const firstYearStudents = await Student.find({ year: 'I', isDelete: false });
  
      res.render('firstYearExamFeeTemplate', { firstYearStudents }, async (err, html) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error rendering template');
        }
  
        const options = {
          format: 'A4', 
        };
  
        pdf.create(html, options).toFile('./temp/firstYearFeeList.pdf', (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error creating PDF');
          }
  
          res.download('./temp/firstYearFeeList.pdf', 'I MCA Exam Fees Details.pdf', (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Error downloading PDF');
            }
  
            fs.unlinkSync('./temp/firstYearFeeList.pdf');
          });
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
};

exports.downloadSecondYrExFeePDF = async (req, res) => {
    try {
      const secondYearStudents = await Student.find({ year: 'II', isDelete: false });
  
      res.render('secondYearExamFeeTemplate', { secondYearStudents }, async (err, html) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error rendering template');
        }
  
        const options = {
          format: 'A4', 
        };
  
        pdf.create(html, options).toFile('./temp/firstYearFeeList.pdf', (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error creating PDF');
          }
  
          res.download('./temp/firstYearFeeList.pdf', 'II MCA Exam Fees Details.pdf', (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Error downloading PDF');
            }
  
            fs.unlinkSync('./temp/firstYearFeeList.pdf');
          });
        });
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
};


module.exports = exports;

const express = require("express");
const Student = require("../models/studentModel");
const app = express();

exports.newStudent = async (req, res) => {
  const body = req.body;
  const student = new Student({
    name: body.name,
    registerNumber: body.registerNumber,
    gender: body.gender,
    age: body.age,
    year: body.year,
    phone: body.phone,
    email: body.email
  });
  try {
    const savedUser = await student.save();
    console.log("User Added to DataBase...");
    res.redirect("/ssm/mca/register");
    console.log(savedUser);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Student.findByIdAndUpdate(userId, { isDelete: true });
    res.redirect("/ssm/mca/studentList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const body = req.body;
    const userId = req.params.userId;

    await Student.findByIdAndUpdate(userId, {
        name: body.name,
        gender: body.gender,
        age: body.age,
        year: body.year,
        phone: body.phone,
        email: body.email
    });

    res.redirect("/ssm/mca/studentList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

module.exports = exports;

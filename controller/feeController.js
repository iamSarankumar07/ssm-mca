const StudentFee = require("../models/studentModel");

/* exports.newFee = async (req, res) => {
  const body = req.body;
  const student = StudentFee({
    name: body.name,
    year: body.year,
    totalFee: body.totalFee,
    pendingFee: body.pendingFee
  });
  try {
    const studentFee = await student.save();
    console.log("Student Fee Added to DataBase...");
    res.redirect("/ssm/mca/feeRegister");
    console.log(studentFee);
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
}; */

exports.deleteFee = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await StudentFee.findByIdAndUpdate(userId, { isDelete: true });
    res.redirect("/ssm/mca/feeList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

exports.updateFee = async (req, res) => {
  try {
    const body = req.body;
    const userId = req.params.userId;

    await StudentFee.findByIdAndUpdate(userId, {
        name: body.name,
        year: body.year,
        totalFee: body.totalFee,
        pendingFee: body.pendingFee,
        paymentStatus: body.paymentStatus
    });

    res.redirect("/ssm/mca/feeList");
  } catch (err) {
    console.error(err);
    res.send("Error");
  }
};

module.exports = exports;

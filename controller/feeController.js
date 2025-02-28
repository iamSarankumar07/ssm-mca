const StudentFee = require("../models/studentModel");
const moment = require("moment");

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

// exports.deleteFee = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await StudentFee.findByIdAndUpdate(userId, { isDelete: true });
//     res.redirect("/ssm/mca/feeList");
//   } catch (err) {
//     console.error(err);
//     res.send("Error");
//   }
// };

exports.updateFee = async (req, res) => {
  try {
    const body = req.body;
    const studentId = req.params.userId;
    let status;

    let studentData = await StudentFee.findById(studentId);

    let totalFeeTu = Number(studentData.totalFee);
    let currentPendingFee = Number(studentData.totalFee) - Number(body.paidFeeTu);
    let pendingFee = currentPendingFee.toString();

    if (totalFeeTu == body.paidFeeTu) {
      status = "Paid";
    } else if (Number(body.paidFeeTu) === 0 || Number(studentData.paidFeeTu) === 0) {
        status = "Pending";
    } else {
        status = "Partial";
    }

    await StudentFee.findByIdAndUpdate(studentId, {
        totalFee: body.totalFee,
        paidFeeTu: body.paidFeeTu,
        pendingFee: pendingFee,
        paymentStatus: status
    });

    // res.redirect("/ssm/mca/feeList");
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
            <p>Tuition Fee Updated!</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/feeList";
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
    console.error(err);
    res.send("Error");
  }
};
exports.updateExamFee = async (req, res) => {
  try {
    const body = req.body;
    const studentId = req.params.userId;
    let status;

    let studentData = await StudentFee.findById(studentId);

    let totalFeeEx = Number(studentData.examTotalFee);
    let currentPendingFee = Number(studentData.examTotalFee) - Number(body.paidFeeEx);
    let pendingFee = currentPendingFee.toString();

    if (totalFeeEx == body.paidFeeEx) {
      status = "Paid";
    } else if (Number(body.paidFeeEx) === 0 || Number(studentData.paidFeeEx) === 0) {
        status = "Pending";
    } else {
        status = "Partial";
    }

    await StudentFee.findByIdAndUpdate(studentId, {
        examTotalFee: body.examTotalFee,
        paidFeeEx: body.paidFeeEx,
        examPendingFee: pendingFee,
        examPaymentStatus: status
    });

    // res.redirect("/ssm/mca/examFeeList");
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
            <p>Exam Fee Updated!</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/examFeeList";
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
    console.error(err);
    res.send("Error");
  }
};

exports.updateDueDatesForAll = async (req, res) => {
  try {
    const body = req.body;
    const year = body.year;

    body.tutionDueDate = moment(body.tutionDueDate).format('DD-MM-YYYY');
    body.examDueDate = moment(body.examDueDate).format('DD-MM-YYYY');

    let filter = {};
    if (year === "first" || year === "second") {
      filter = { year: year === "first" ? "I" : "II" };
    } else {
      return res.send(
        '<script>alert("Please Select Year"); window.location.href = "/ssm/mca/signin";</script>'
      );
    }

    await StudentFee.updateMany(filter, {
        tutionDueDate: body.tutionDueDate,
        examDueDate: body.examDueDate
    });

    // res.redirect("/ssm/mca/dashboard");
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
            <p>Due Date Updated!</p>
            <div class="button-container">
              <button type="button" onclick="redirect()">Continue</button>
            </div>
          </div>
        </div>
      
        <script>
          function redirect() {
            window.location.href = "/ssm/mca/dashboard";
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
    console.error(err);
    res.send("Error");
  }
};


module.exports = exports;

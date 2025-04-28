const mongoose = require('mongoose');

const EmployeeSalaryTransactionSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    salaryAmount: {
        type: Number,
        required: false
    },
    status: {
        type: String,
        default: "Pending",
        required: false
    },
    txnDate: {
        type: Date,
        required: false
    }
});


module.exports = mongoose.model('employeeSalaryTransaction', EmployeeSalaryTransactionSchema);
const mongoose = require('mongoose');

const EmployeeSalarySchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    salaryAmount: {
        type: Number,
        required: false
    },
    isActive: {
        type: Boolean,
        required: false
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    }
});


module.exports = mongoose.model('employeeSalary', EmployeeSalarySchema);
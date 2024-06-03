const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
    },
    registerNumber: {
        type: Number,
        required: false,
    },
    gender: {
        type: String,
        required: false,
    },
    dob: {
        type: String,
        required: false
    },
    year: {
        type: String,
        required: false,
    },
    phone: {
        type: Number,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
    studentId: {
        type: String,
        required: false,
    },
    address: {
        address: String,
        city: String,
        state: String,
        pinCode: String,
        country: String
    },
    state: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false,
    },
    totalFee: {
        type: Number,
        required: false
    },
    pendingFee: {
        type: Number,
        required: false
    },
    paymentStatus: {
        type: String,
        required: false
    },
    examTotalFee: {
        type: Number,
        required: false
    },
    examPendingFee: {
        type: Number,
        required: false
    },
    examPaymentStatus: {
        type: String,
        required: false
    },
    tutionDueDate: {
        type: String,
        required: false
    },
    examDueDate: {
        type: String,
        required: false
    },
    graduationYear: {
        type: String,
        default: null,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    isAlumni: {
        type: Boolean,
        default: false,
    },
    addressUpdate: {
        type: Boolean,
        default: false,
    },
    editRequest: {
        newName: String,
        newEmail: String,
        newDob: String,
        newPhone: String,
        status: String
    },
    tuEditRequest: {
        newTuPending: String,
        newTuStatus: String,
        status: String
    },
    exEditRequest: {
        newExPending: String,
        newExStatus: String,
        status: String
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    }
});

module.exports = mongoose.model('students', studentSchema);

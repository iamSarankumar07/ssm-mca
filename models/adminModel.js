const mongoose = require('mongoose');

const Loginschema = new mongoose.Schema({

    staffId: {
        type: String,
        required: false
    },
    employeeId: {
        type: String,
        required: false
    },
    employeeCode: {
        type: String,
        required: false
    },
    fullName: {
        type: String,
        required: false
    },
    firstName: {
        type: String,
        required: false
    },
    lastName: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    dob: {
        type: String,
        required: false
    },
    nationality: {
        type: String,
        required: false
    },
    aadhaarNum: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    pinCode: {
        type: String,
        required: false
    },
    department: {
        type: String,
        required: false
    },
    designation: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    },
    joiningDate: {
        type: String,
        required: false
    },
    experience: {
        type: String,
        required: false
    },
    specialization: {
        type: String,
        required: false
    },
    highestQualification: {
        type: String,
        required: false
    },
    university: {
        type: String,
        required: false
    },
    yearOfPassing: {
        type: String,
        required: false
    },
    certifications: {
        type: String,
        required: false
    },
    emergencyContact: {
        type: String,
        required: false
    },
    emergencyPhone: {
        type: String,
        required: false
    },
    researchInterests: {
        type: String,
        required: false
    },
    publications: {
        type: String,
        required: false
    },
    additionalInfo: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: false
    },
    salary: {
        type: String,
        required: false
    },
    currentMonthSalary: {
        type: String,
        required: false
    },
    beneId: {
        type: String,
        required: false
    },
    bankDetails: {
        accountHolderName: { type: String, required: false },
        accountNumber: { type: String, required: false },
        ifscCode: { type: String, required: false },
        bankName: { type: String, required: false },
        upiId: { type: String, required: false },
    },
    razorpayContactId: {
        type: String,
        required: false,
        default: null
    },
    razorpayFundAccountId: {
        type: String,
        required: false,
        default: null
    },
    transactions: [
        {
          amount: { type: Number, required: false },
          transactionId: { type: String, required: false },
          status: { type: String, default: 'Pending' },
          date: { type: Date, default: Date.now }
        }
    ],
    token: {
        type: String
    },
    otp: {
        type: String,
        required: false
    },
    isFaculty: {
        type: Boolean,
        required: false
    },
    isSuperAdmin: {
        type: Boolean,
        required: false
    },
    isAdmin: {
        type: Boolean,
        required: false
    },
    forgotOtp: {
        type: String,
        required: false
    },
    leaveBalance: {
        casual: { type: Number, default: 0 },
        casualTotal: { type: Number, default: 12 },

        sick: { type: Number, default: 0 },
        sickTotal: { type: Number, default: 10 },

        earned: { type: Number, default: 0 },
        earnedTotal: { type: Number, default: 0 }
    },

    lastLeaveCarryForward: { 
        type: Date, 
        default: null 
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    lastUpdated: {
        type: Date,
        default: () => Date.now(),
    },
    updatedBy: {
        type: String,
        required: false
    },
});
  

module.exports = mongoose.model('Admin', Loginschema);
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  registerNumber: {
    type: String,
    required: false,
  },
  aadhaarNum: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  dob: {
    type: String,
    required: false,
  },
  year: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
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
    country: String,
  },
  state: {
    type: String,
    required: false,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  course: {
    type: String,
    required: false,
  },
  courseDuration: {
    type: String,
    required: false,
  },
  parentName: {
    type: String,
    required: false,
  },
  parentalIncome: {
    type: String,
    required: false,
  },
  parentPhone: {
    type: String,
    required: false,
  },
  previousInstitution: {
    type: String,
    required: false,
  },
  bridgeCourse: {
    type: String,
    required: false,
  },
  previousMarks: {
    type: String,
    required: false,
  },
  emergencyContact: {
    type: String,
    required: false,
  },
  emergencyContactRelationship: {
    type: String,
    required: false,
  },
  emergencyPhone: {
    type: String,
    required: false,
  },
  religion: {
    type: String,
    required: false,
  },
  bloodGroup: {
    type: String,
    required: false,
  },
  nationality: {
    type: String,
    required: false,
  },
  scholarship: {
    type: String,
    required: false,
  },
  transportation: {
    type: String,
    required: false,
  },
  admissionDate: {
    type: String,
    required: false,
  },
  hostelRequired: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  totalFee: {
    type: String,
    required: false,
  },
  pendingFee: {
    type: String,
    required: false,
  },
  paidFeeTu: {
    type: String,
    required: false,
  },
  paymentStatus: {
    type: String,
    required: false,
  },
  examTotalFee: {
    type: String,
    required: false,
  },
  paidFeeEx: {
    type: String,
    required: false,
  },
  examPendingFee: {
    type: String,
    required: false,
  },
  examPaymentStatus: {
    type: String,
    required: false,
  },
  tutionDueDate: {
    type: String,
    required: false,
  },
  examDueDate: {
    type: String,
    required: false,
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
  forgotOtp: {
    type: String,
    default: false,
  },
  tuitionFees: {
    totalFee: Number,
    paidFee: Number,
    pendingFee: {
      type: Number,
      default: function () {
        return this.totalFee && this.paidFee ? this.totalFee - this.paidFee : 0;
      },
    },
    dueDate: String,
    paidDate: String,
    txnId: String,
    payMode: String,
    imageUrl: String,
    status: String,
    semester: String,
  },
  examFees: {
    totalFee: Number,
    paidFee: Number,
    pendingFee: {
      type: Number,
      default: function () {
        return this.totalFee && this.paidFee ? this.totalFee - this.paidFee : 0;
      },
    },
    dueDate: String,
    paidDate: String,
    txnId: String,
    payMode: String,
    imageUrl: String,
    status: String,
    semester: String,
  },
  examResults: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      semester: Number,
      subjectCode: String,
      subjectName: String,
      grade: String,
      result: String,
    },
  ],
  skills: {
    type: Array,
    default: [],
    required: false,
  },
  achievements: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      title: {
        type: String,
        required: false,
      },
      description: {
        type: String,
        required: false,
      },
      year: {
        type: String,
        required: false,
      },
    },
  ],
  experiences: [
    {
        _id: mongoose.Schema.Types.ObjectId,
        title: {
            type: String,
            required: false,
        },
        company: {
            type: String,
            required: false,
        },
        location: {
            type: String,
            required: false,
        },
        startDate: {
            type: String,
            required: false,
        },
        endDate: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
        },
        currentlyWorking: {
            type: Boolean,
            required: false,
        },
        skills: {
            type: [String],
            required: false,
        }
    },
  ],
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  updatedAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
});

module.exports = mongoose.model('students', studentSchema);
const mongoose = require("mongoose");

const feesUpdateRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    required: false,
  },
  requestId: {
    type: String,
    required: false,
  },
  upiReference: {
    type: String,
    required: false,
  },
  feeType: {
    type: String,
    enum: ["Exam", "Tuition"],
    required: false,
  },
  amountDetails: { 
    currentPaidAmount: {
        type: Number,
        require: false
    },
    paidAmount: {
        type: Number,
        require: false
    },
    pendingAmount: {
        type: Number,
        require: false
    },
  },
  course: { 
    type: String, 
    required: false 
  },
  year: { 
    type: String, 
    required: false 
  },
  semester: { 
    type: String, 
    required: false 
  },
  comments: { 
    type: String, 
    required: false 
  },
  attachment: { 
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  adminComment: { 
    type: String,
    required: false
  },
  requestedOn: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("feesUpdateRequest", feesUpdateRequestSchema);

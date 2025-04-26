const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  type: {
    type: String,
    enum: ["Casual", "Sick", "Earned", "Maternity"],
    required: true,
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  reason: { 
    type: String, 
    required: true 
  },
  attachment: { 
    type: String 
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  adminComment: { 
    type: String 
  },
  appliedOn: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);

const mongoose = require("mongoose")

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "students",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true })

connectionSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
});

module.exports = mongoose.model("Connection", connectionSchema);
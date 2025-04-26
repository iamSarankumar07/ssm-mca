const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    staffId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Admin', 
      required: true 
    },
    date: { 
      type: Date, 
      required: true 
    },
    status: { 
      type: String, 
      required: true 
    }
});

module.exports = mongoose.model('staffAttendance', AttendanceSchema);
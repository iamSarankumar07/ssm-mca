const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'students', 
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

module.exports = mongoose.model('attendance', AttendanceSchema);

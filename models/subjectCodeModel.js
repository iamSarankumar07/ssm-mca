const mongoose = require("mongoose");

const SubjectCodeSchema = new mongoose.Schema({
    subjectCode: { 
        type: String, 
        required: false,
    },
    subjectName: { 
        type: String, 
        required: false, 
    }
}, { timestamps: true });

const SubjectCode = mongoose.model("subjectCode", SubjectCodeSchema);
module.exports = SubjectCode;

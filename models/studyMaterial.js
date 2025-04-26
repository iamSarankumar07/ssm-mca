const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
    subjectCode: String,
    subjectTitle: String,
    course: String,
    semester: String,
    year: String,
    fileUrl: String,
    fileSize: String,
    isDelete: Boolean,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    }
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
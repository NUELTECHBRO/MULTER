const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FreeCourse",
        required: true
    }
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
const mongoose = require("mongoose")

const courseSchema = mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    description: { type: String, required: true },
    video: { type: String, required: true },
    thumbnail: { type: String, required: true }
}, )

const freecourse = mongoose.model("FreeCourse", courseSchema)

module.exports = freecourse;
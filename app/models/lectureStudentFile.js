var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    filename: String,
    filepath: String,
    created_at: Date,
});

module.exports = mongoose.model("LectureStudentFile", postSchema);

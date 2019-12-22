var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  desc: String,

  status: {
    type: String,
    enum: ["tobeuploaded", "uploaded", "checked"],
    default: "tobeuploaded"
  },

  filename: String,
  filepath: String,
  created_at: Date
});

module.exports = mongoose.model("LectureStudentFile", postSchema);

var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
  name: String,
  desc: String,
  created_at: Date,
  updated_at: Date,
  
  type: {
    type: String,
    enum: ["material", "test", "text", "unconfirmed"],
    default: "unconfirmed"
  },

  filename: String,
  filepath: String,
  test: Object,
  text: String,

  requiresFile: Boolean,
  postedFiles: [{ type: mongoose.Schema.Types.ObjectId, ref: "LectureStudentFile" }],
});

module.exports = mongoose.model("LectureItem", postSchema);

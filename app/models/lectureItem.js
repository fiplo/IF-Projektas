var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
  name: String,
  desc: String,
  created_at: Date,
  updated_at: Date,
  type: {
    type: String,
    enum: ["material", "test", "unconfirmed"],
    default: "unconfirmed"
  },
});

module.exports = mongoose.model("LectureItem", postSchema);

var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
  name: String,
  desc: String,
  created_at: Date,
  updated_at: Date,
  contact: String,
  items: Array
});

module.exports = mongoose.model("Lecture", postSchema);

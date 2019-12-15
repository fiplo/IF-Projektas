var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
  originalname: String,
  destination: String,
  filename: String,
  path: String,
  postname: String,
  desc: String,
  created_at: Date,
  updated_at: Date,
  contact: String
});

module.exports = mongoose.model("Offer", postSchema);

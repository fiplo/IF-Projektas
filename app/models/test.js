var mongoose = require("mongoose");

var questionSchema = mongoose.Schema({
  question: String,
  answers: [String],
  correctAnswer: String
});

var testSchema = mongoose.Schema({
  originalname: String,
  madeBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dateCreated: Date,
  questions: [questionSchema]
});

module.exports = mongoose.model("Test", testSchema);

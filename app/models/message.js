var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
    from: String,
    to: String,
    subject: String,
    text: String,
});

module.exports = mongoose.model("Message", postSchema);

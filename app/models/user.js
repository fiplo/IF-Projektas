var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var userSchema = mongoose.Schema({
  local: {
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    
    faculty: {
      type: String,
      default: "unknown"
    },

    userType: {
      type: String,
      enum: ["student", "admin", "lecturer", "unconfirmed"],
      default: "unconfirmed"
    },

    lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lecture" }],

    messages: {
      sent: Array,
      received: Array,
    },

    about: {
      profileImage: { filename: String, destination: String, },
      text: { type: String, default: "" },
    },
  },
});

// Gen Hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Check if password valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

// Create model for userSchema
module.exports = mongoose.model("User", userSchema);

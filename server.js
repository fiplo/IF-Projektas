// Tool setup
var express = require("express");
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require("mongoose");
var passport = require("passport");
var flash = require("connect-flash");

var fs = require("fs");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var multer = require("multer");
var ejsLint = require("ejs-lint");

var configDB = require("./config/database.js");

// Config

if (!fs.existsSync("uploads/")) {
  fs.mkdirSync("uploads/");
}

mongoose.connect(configDB.url);

require("./config/passport")(passport);

app.use("/uploads", express.static("uploads"));

// Express setup
app.use(morgan("dev")); //Log everything
app.use(cookieParser()); // Read cookies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // get info from html forms

app.set("view engine", "ejs"); // ejs templating

// Passport configuration
app.use(session({ secret: "itreallydobelikethatsometimes" })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // Persistent login sessions
app.use(flash());

//Storage Engine
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    var originalname = file.originalname;
    var extension = originalname.split(".");
    filename = Date.now() + "." + extension[extension.length - 1];
    cb(null, filename);
  }
});

// Routes
require("./app/routes.js")(app, passport, multer, storage);

// Launch
app.listen(port);
console.log("Server launched on port " + port);

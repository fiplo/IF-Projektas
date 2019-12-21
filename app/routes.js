var mongo = require('mongodb');
var mongoose = require('mongoose');
var Lecture = require("../app/models/post");
var LectureItem = require("../app/models/lectureItem");
var User = require("../app/models/user");

module.exports = function(app, passport, multer, storage) {
  // Main page
  app.get("/", function(req, res) {
    res.render("index.ejs");
  });

  // Login Screen
  app.get("/login", function(req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  //Processing login form
  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/profile",
      failureRedirect: "/login",
      failureFlash: true
    })
  );

  // Signup
  app.get("/signup", function(req, res) {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });
  // process the signup form
  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/profile",
      failureRedirect: "/signup",
      failureFlash: true
    })
  );

  //Profile Page
  app.get("/profile", isLoggedIn, function(req, res) {
    res.render("profile.ejs", {
      user: req.user
    });
  });

  //Posting page
  app.get("/post", isLoggedIn, function(req, res) {
    res.render("createTest.ejs", {
      user: req.user
    });
  });

  app.post(
    "/post",
    multer({ storage: storage, dest: "./uploads/" }).single("file"),
    function(req, res) {
      console.log(req);
      var lecture = new Lecture({
        name: req.postname,
        desc: req.body.postdesc,
        name: req.body.postname,
        created_at: Date.now(),
        contact: req.user.email,
        items: []
      });
      lecture.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/profile");
        }
      });
    }
  );

  //Logout
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  app.get("/list", isLoggedIn, function(req, res) {
    Lecture.find({}).exec(function(err, lectures) {
      if (err) throw err;
      res.render("listLectures.ejs", { lectures: lectures });
    });
  });

  // Individual lecture
  app.get("/lecture/:id", isLoggedIn, function(req, res) {
    Lecture.findOne({_id: req.params.id}).exec(function(err, lecture) {
      if (err) throw err;
      res.render("lecture.ejs", { lecture: lecture, user: req.user });
    });
  });


  // Posting inside lecture
  app.get("/postLectureItem/:id", isLoggedIn, function(req, res) {
    Lecture.findOne({_id: req.params.id}).exec(function(err, lecture) {
      if (err) throw err;
      res.render("lecture/postLectureItem.ejs", { lecture: lecture, user: req.user });
    });
  });

  app.post(
    "/postLectureItem/:id",
    multer().none(),
    function(req, res) {
      console.log(req);
      var lectureItem = new LectureItem({
        name: req.postname,
        desc: req.body.postdesc,
        name: req.body.postname,
        created_at: Date.now(),
      });

      lectureItem.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/lecture/:id");
        }
      });
    }
  );

  //User checkup
  function isLoggedIn(req, res, next) {
    //If authenticated, carry on
    if (req.isAuthenticated()) return next();

    //Back to mainpage
    res.redirect("/");
  }


  // Admin interface
  app.get("/admin", isLoggedIn, function(req, res) {
    User.find({}).exec(function(err, users) {
      if (err) throw err;
    res.render("adminInterface.ejs", {
      user: req.user,
      userList: users
    });

  })});

// Admin interface - Edit user
app.get("/editUser/:id", isLoggedIn, function(req, res) {
  User.findOne({_id: req.params.id}).exec(function(err, user) {
    if (err) throw err;
  res.render("editUser.ejs", {
    user: req.user,
    userInfo: user
  });
})});

app.post(
  "/editUser/:id",
  multer().none(),
  function(req, res) {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID.");

    console.log(req.body);

    User.findOne({_id: req.params.id}).exec(function(err, user) {
      user.$locals.email = req.body.email;
      user.$locals.userType = req.body.userType;
      user.$locals.faculty = req.body.faculty;
      user.save();
      console.log(user);
    });

    res.redirect("/admin");


    /*
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID.");
    User.findOneAndUpdate({ _id: req.params.id },
      { email: req.body.email,
      userType: req.body.userType,
      faculty: req.body.faculty, }
      )
      .exec(function(err, user) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/admin");
      }
     });*/
     
  }
);


};

var Lecture = require("../app/models/post");
var LectureItem = require("../app/models/lectureItem");
const mongoose = require("mongoose");

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

  app.get("/createtest", isLoggedIn, function(req, res) {
    res.render("createtest.ejs", {
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send("Invalid ID.");
    Lecture.findOne({ _id: req.params.id }).exec(function(err, lecture) {
      if (err) throw err;
      LectureItem.find()
        .where("_id")
        .in(lecture.items)
        .exec((err, records) => {
          if (err) throw err;
          console.log(records);
          res.render("lecture.ejs", {
            lecture: lecture,
            user: req.user,
            items: records
          });
        });
    });
  });

  // Posting inside lecture
  app.get("/postLectureItem/:id", isLoggedIn, function(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send("Invalid ID.");
    Lecture.findOne({ _id: req.params.id }).exec(function(err, lecture) {
      if (err) throw err;
      if (!lecture) {
        res.redirect("/list");
      } else {
        res.render("lecture/postLectureItem.ejs", {
          lecture: lecture,
          user: req.user
        });
      }
    });
  });

  app.post(
    "/postLectureItem/:id",
    multer({ storage: storage, dest: "./uploads/" }).single("file"),
    function(req, res) {
      console.log(mongoose.Types.ObjectId.isValid(req.params.id));
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send("Invalid ID.");
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        Lecture.findById(req.params.id).exec(function(err, lecture) {
          if (err) throw err;
          console.log(req);
          var lectureItem = new LectureItem({
            name: req.postname,
            desc: req.body.postdesc,
            name: req.body.postname,
            filepath: req.file.path,
            created_at: Date.now()
          });

          lectureItem.save(function(err) {
            if (err) {
              console.log(err);
            } else {
              lecture.items.push(lectureItem._id);
              lecture.save(function(err) {
                if (err) {
                  console.log(err);
                } else {
                  res.redirect("/lecture/" + req.params.id);
                }
              });
            }
          });
        });
      }
    }
  );

  //User checkup
  function isLoggedIn(req, res, next) {
    //If authenticated, carry on
    if (req.isAuthenticated()) return next();

    //Back to mainpage
    res.redirect("/");
  }
};

var Lecture = require("../app/models/post");

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
    res.render("post.ejs", {
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

  app.get("/list", function(req, res) {
    Lecture.find({}).exec(function(err, lectures) {
      if (err) throw err;
      res.render("listLectures.ejs", { lectures: lectures });
    });
  });

  //User checkup
  function isLoggedIn(req, res, next) {
    //If authenticated, carry on
    if (req.isAuthenticated()) return next();

    //Back to mainpage
    res.redirect("/");
  }






};

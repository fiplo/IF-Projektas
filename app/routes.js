var mongo = require('mongodb');
var mongoose = require('mongoose');
var Lecture = require("../app/models/post");
var LectureItem = require("../app/models/lectureItem");
var User = require("../app/models/user");
var Message = require("../app/models/message");

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

  // Profile Page
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

  // Edit Profile Page
  app.get("/editProfile", isLoggedIn, function(req, res) {
    res.render("editProfile.ejs", {
      user: req.user
    });
  });

  app.post(
    "/editProfile",
    isLoggedIn,
    multer({ storage: storage, dest: "./uploads/" }).single("file"),
    function(req, res) {
      User.findOneAndUpdate({_id: req.user._id},
        (req.file) !== undefined ? 
          { $set: { "local.about.text": req.body.about,
            "local.about.profileImage.filename": req.file.filename,
            "local.about.profileImage.destination": req.file.destination, } }
            :
            {
              $set: { "local.about.text": req.body.about, },
            },
        (err, doc) => {
        if (err) {
              console.log("Something wrong when updating data!");
          }
          console.log(doc);
      });
      
      res.redirect("/profile");
    }
  );

  // Posting page
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
      res.render("listLectures.ejs", { lectures: lectures, user: req.user });
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

  // Lecture editing
  app.get("/editLecture/:id", isLoggedIn, function(req, res) {
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
          res.render("lecture/editLecture.ejs", {
            lecture: lecture,
            user: req.user,
            items: records
          });
        });
    });
  });

  app.post(
    "/editLecture/:id",
    multer().none(),
    function(req, res) {
      if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID.");
  
      Lecture.findOneAndUpdate({_id: req.params.id},
        { $set: {"name": req.body.name,
                "desc": req.body.desc, }},
        (err, doc) => {
        if (err) {
              console.log("Something wrong when updating data!");
          }
          console.log(doc);
      });
      
      res.redirect("/list");
    }
  );

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
    multer().none(),
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

    User.findOneAndUpdate({_id: req.params.id},
      { $set: {"local.email": req.body.email,
              "local.userType": req.body.userType,
              "local.faculty": req.body.faculty}},
      (err, doc) => {
      if (err) {
            console.log("Something wrong when updating data!");
        }
        console.log(doc);
    });
    
    res.redirect("/admin");
  }
);


// Messaging
app.get("/messages", isLoggedIn, function(req, res) {
  User.find({}).exec(function(err, users) {
    if (err) throw err;
  res.render("messages.ejs", {
    user: req.user,
    userList: users,
  });

})});

app.get("/newMessage", isLoggedIn, function(req, res) {
  User.find().exec(function(err, users) {
    if (err) throw err;

  res.render("newMessage.ejs", {
    user: req.user,
    usersList: users,
  });

})});

app.post(
  "/newMessage",
  isLoggedIn,
  multer().none(),
  function(req, res) {

    const newMessage = new Message({
      from: req.user._id,
      to: req.body.receiver,
      subject: req.body.subject,
      text: req.body.message,
    });

    User.findOneAndUpdate({ _id: req.user._id }, { $push: { "local.messages.sent": newMessage }}, (err, doc) => {
      if (err) {
            console.log("Something wrong when updating data!");
        }
        console.log(doc);
    });

    User.findOneAndUpdate({ _id: req.body.receiver }, { $push: { "local.messages.received": newMessage }}, (err, doc) => {
      if (err) {
            console.log("Something wrong when updating data!");
        }
        console.log(doc);
    });

    newMessage.save();

    res.redirect("/messages");
  }
);

  // assign stud list
  app.get("/assignstud", isLoggedIn, function(req, res) {
    User.find({ "local.userType":"student"}).exec(function(err, users) {
      if (err) throw err;
      res.render("assignStudent.ejs", {
        user: req.user,
        userList: users
      });

    })});

// Assign student interface
  app.get("/assignstud/:id", isLoggedIn, function(req, res, next) {
    User.findOne({_id: req.params.id}).exec(function(err, user) {
      if (err) throw err;
      res.locals.stud = user;
      next();
      /*res.render("assignStudForm.ejs", {
        user: req.user,
        userInfo: user
      });*/
    })
  }, function(req, res) {
    Lecture.find({}).exec(function(err, lectures) {
      if (err) throw err;

      res.render("assignStudForm.ejs", {
        user: req.user,
        studInfo: res.locals.stud,
        lectures: lectures
      });
    })
  });

  app.post(
      "/assignstud/:id",
      multer().none(),
      function(req, res) {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID.");

        User.findOneAndUpdate({_id: req.params.id},
            { $addToSet: {"local.lectures": req.body.lecture
            }},
            (err, doc) => {
              if (err) {
                console.log("Something wrong when updating data!");
              }
              console.log(doc);
            });

        res.redirect("/assignstud");
      }
  );


};

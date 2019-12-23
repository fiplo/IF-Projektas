var mongo = require("mongodb");
var mongoose = require("mongoose");
var Lecture = require("../app/models/post");
var LectureItem = require("../app/models/lectureItem");
var User = require("../app/models/user");
var Message = require("../app/models/message");
var Quiz = require("../app/models/test");
var LectureStudentFile = require("../app/models/lectureStudentFile");

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
    LectureStudentFile.find({
      $or: [{ student: req.user._id }, { lecturer: req.user._id }]
    }).exec(function(err, uzduotis) {
      if (err) throw err;
      res.render("profile.ejs", {
        user: req.user,
        assignments: uzduotis
      });
    });
  });
  //List of tasks related to User
  app.get("/tasks", isLoggedIn, function(req, res) {
    LectureStudentFile.find({
      $or: [{ student: req.user._id }, { lecturer: req.user._id }]
    }).exec(function(err, uzduotis) {
      if (err) throw err;
      res.render("listAssin.ejs", {
        user: req.user,
        assignments: uzduotis
      });
    });
  });

  app.get("/createTest:id", isLoggedIn, function(req, res) {
    if (isNaN(req.params.id)) {
      res.render("specified number is not a number");
    } else {
      res.render("createTest.ejs", {
        user: req.user,
        klcount: req.params.id
      });
    }
  });

  app.post("/createTest", multer().none(), function(req, res) {});

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
      User.findOneAndUpdate(
        { _id: req.user._id },
        req.file !== undefined
          ? {
              $set: {
                "local.about.text": req.body.about,
                "local.about.profileImage.filename": req.file.filename,
                "local.about.profileImage.destination": req.file.destination
              }
            }
          : {
              $set: { "local.about.text": req.body.about }
            },
        (err, doc) => {
          if (err) {
            console.log("Something wrong when updating data!");
          }
          console.log(doc);
        }
      );

      res.redirect("/profile");
    }
  );

  // Posting page
  app.get("/post", isLoggedIn, function(req, res) {
    res.render("post.ejs", {
      user: req.user
    });
  });

  app.get("/createTest", isLoggedIn, function(req, res) {
    res.render("selectQuestion");
  });

  /*app.post("/post", multer().none(), function(req, res) {
    if (isNaN(req.body.numberofq)) {
      res.render("selectQuestion");
    } else {
      res.redirect("/createTest" + req.body.numberofq);
    }
  });*/

  app.post(
    "/post",
    multer({ storage: storage, dest: "./uploads/" }).single("file"),
    function(req, res) {
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
    if(req.user.local.userType === 'student'){
      Lecture.find({_id: req.user.local.lectures}).exec(function(err, lectures) {
        if (err) throw err;
        res.render("listLectures.ejs", { lectures: lectures, user: req.user });
      });
    } else {
      Lecture.find({}).exec(function(err, lectures) {
        if (err) throw err;
        res.render("listLectures.ejs", { lectures: lectures, user: req.user });
      });
    }
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

  app.post("/editLecture/:id", multer().none(), function(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send("Invalid ID.");

    Lecture.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { name: req.body.name, desc: req.body.desc } },
      (err, doc) => {
        if (err) {
          console.log("Something wrong when updating data!");
        }
        console.log(doc);
      }
    );

    res.redirect("/list");
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

          if (req.body.type === "material") {
            var lectureItem = new LectureItem({
              name: req.body.postname,
              desc: req.body.postdesc,

              type: "material",
              filename: req.file.filename,
              filepath: req.file.path,
              test: null,
              text: "",

              requiresFile: req.body.fileRequired,
              requiresFilename: "",
              requiresFilepath: "",

              created_at: Date.now()
            });

            lectureItem.save(function(err) {
              if (err) {
                console.log(err);
              } else {
                lecture.items.push(lectureItem._id);
                lecture.save(function(err) {
                  if (err) console.log(err);
                });
              }
            });
          } else if (req.body.type === "test") {
            console.log("SENT TEST");
            // ----- TODO :
            // Create lectureItem as Test and assign it to lecture.
          } else if (req.body.type === "text") {
            console.log("SENT TEXT");
            var lectureItem = new LectureItem({
              name: req.body.postname,
              desc: req.body.postdesc,

              type: "text",
              filename: "",
              filepath: "",
              test: null,
              text: req.body.text,

              requiresFile: req.body.fileRequired,
              requiresFilename: "",
              requiresFilepath: "",

              created_at: Date.now()
            });

            lectureItem.save(function(err) {
              if (err) {
                console.log(err);
              } else {
                lecture.items.push(lectureItem._id);
                lecture.save(function(err) {
                  if (err) console.log(err);
                });
              }
            });
          }

          /*
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
        */
          res.redirect("/lecture/" + req.params.id);
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
    });
  });

  // Admin interface - Edit user
  app.get("/editUser/:id", isLoggedIn, function(req, res) {
    User.findOne({ _id: req.params.id }).exec(function(err, user) {
      if (err) throw err;
      res.render("editUser.ejs", {
        user: req.user,
        userInfo: user
      });
    });
  });

  app.post("/editUser/:id", multer().none(), function(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(404).send("Invalid ID.");

    User.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          "local.email": req.body.email,
          "local.userType": req.body.userType,
          "local.faculty": req.body.faculty
        }
      },
      (err, doc) => {
        if (err) {
          console.log("Something wrong when updating data!");
        }
        console.log(doc);
      }
    );

    res.redirect("/admin");
  });

  //Lecturer requesting Students assignment
  app.get("/requestStudentFile", isLoggedIn, function(req, res) {
    User.find({}).exec(function(err, users) {
      if (err) throw err;
      res.render("request.ejs", {
        user: req.user,
        usersList: users
      });
    });
  });

  app.post("/requestStudentFile", isLoggedIn, multer().none(), function(
    req,
    res
  ) {
    const newRequest = new LectureStudentFile({
      student: req.body.receiver,
      lecturer: req.user._id,
      name: req.body.postname,
      desc: req.body.postdesc,
      dateuntil: req.body.dateuntil
    });
    newRequest.save();
    res.redirect("/profile");
  });

  //Student answering Lecturers assignment
  app.get("/answerRequest/:id", isLoggedIn, function(req, res) {
    LectureStudentFile.findOne({ _id: req.params.id }).exec(function(
      err,
      files
    ) {
      if (err) throw err;
      console.log(files);
      res.render("assignmentUpload.ejs", { user: req.user, reqf: files });
    });
  });

  app.post(
    "/answerRequest/:id",
    isLoggedIn,
    multer({ storage: storage, dest: "./uploads/" }).single("file"),
    function(req, res) {
      LectureStudentFile.findOne({ _id: req.params.id }, function(err, data) {
        data.filepath = req.file.path;
        data.filename = req.file.name;
        data.status = "uploaded";
        data.save();
        res.redirect("/profile");
      });
    }
  );

  //Lecturer evalueates assignment
  app.get("/evaluateAss/:id", isLoggedIn, function(req, res) {
    LectureStudentFile.findOne({ _id: req.params.id }).exec(function(
      err,
      files
    ) {
      var doc = files;
      if (err) throw err;
      console.log(files);
      User.findOne({ _id: files.student }).exec(function(err, student, files) {
        console.log(student);
        console.log(doc);
        if (err) throw err;
        res.render("assignmentEvaluation.ejs", {
          user: req.user,
          reqf: doc,
          studentas: student
        });
      });
    });
  });

  app.post("/evaluateAss/:id", isLoggedIn, multer().none(), function(req, res) {
    LectureStudentFile.findOne({ _id: req.params.id }, function(err, data) {
      data.status = "checked";
      data.result = req.body.mark;
      data.save();
      res.redirect("/profile");
    });
  });

  // Messaging
  app.get("/messages", isLoggedIn, function(req, res) {
    User.find({}).exec(function(err, users) {
      if (err) throw err;
      res.render("messages.ejs", {
        user: req.user,
        userList: users
      });
    });
  });

  app.get("/newMessage", isLoggedIn, function(req, res) {
    User.find().exec(function(err, users) {
      if (err) throw err;

      res.render("newMessage.ejs", {
        user: req.user,
        usersList: users
      });
    });
  });

  app.post("/newMessage", isLoggedIn, multer().none(), function(req, res) {
    const newMessage = new Message({
      from: req.user._id,
      to: req.body.receiver,
      subject: req.body.subject,
      text: req.body.message
    });

    User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { "local.messages.sent": newMessage } },
      (err, doc) => {
        if (err) {
          console.log("Something wrong when updating data!");
        }
        console.log(doc);
      }
    );

    User.findOneAndUpdate(
      { _id: req.body.receiver },
      { $push: { "local.messages.received": newMessage } },
      (err, doc) => {
        if (err) {
          console.log("Something wrong when updating data!");
        }
        console.log(doc);
      }
    );

    newMessage.save();

    res.redirect("/messages");
  });

  // Posting file to lecture item
  app.post(
    "/postStudentFile/:id",
    isLoggedIn,
    multer({ storage: storage, dest: "./uploads/" }).single("file"),
    function(req, res) {
      if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send("Invalid ID.");

      const newFile = new LectureStudentFile({
        student: req.user,

        filename: req.file.filename,
        filepath: req.file.path,
        created_at: Date.now()
      });

      LectureItem.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { postedFiles: newFile } },
        (err, doc) => {
          if (err) {
            console.log("Something wrong when updating data!");
          }
          console.log(doc);
        }
      );

      newFile.save();
      res.redirect("/list");
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

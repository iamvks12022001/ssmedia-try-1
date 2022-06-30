const randomstring = require("randomstring");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const Post = require("../models/post");
const sendEmail = require("../mailers/verify_email");
const setpassword = require("../mailers/set_password");

const newuser = require("../mailers/comments_mailer");
const Token = require("../models/token");
var userlog = {};
module.exports.profile = async function (req, res) {
  let userCurr = await User.findById(req.user.id);
  let friend = userCurr.friends.find(function (value) {
    return value == req.params.id;
  });

  let user = await User.findById(req.params.id).populate("friends", "name ");
  let post = await Post.find({ user: req.params.id }).sort("-createdAt");
  //finding a friend
  if (user) {
    return res.render("profile", {
      title: "User Profile",
      profile_user: user,
      friend: friend,
      Upost: post,
    });
  }
};

module.exports.update = async function (req, res) {
  if (req.user.id == req.params.id) {
    try {
      let user = await User.findByIdAndUpdate(req.params.id);
      User.uploadedAvatar(req, res, function (err) {
        if (err) {
          console.log("*** MUTLER ERROR", err);
        }

        user.name = req.body.name;
        user.email = req.body.email;
        if (req.file) {
          if (user.avatar) {
            if (fs.existsSync(path.join(__dirname, "..", user.avatar))) {
              //deleting the file (old avatar)

              if (
                user.avatar != "\\uploads\\users\\avatars/avatar-1646916243830"
              ) {
                fs.unlinkSync(path.join(__dirname, "..", user.avatar));
              }
            }
          }

          user.avatar = User.avatarPath + "/" + req.file.filename;
        }
        user.save();
        return res.redirect("back");
      });
    } catch (error) {
      req.flash("error", error);
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Unauthorized");
    return res.status(401).send("Unauthorised");
  }
};

module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile/" + req.user.id);
  }
  if (req.cookies.verified == "true") {
    return res.redirect("/users/signupauth");
  }
  // res.cookie("verified", false);
  return res.render("face", {
    title: "iCoder | face detection",
  });
  // return res.render("user_sign_up", {
  //   title: "iCoder | Sign Up",
  // });
};
module.exports.signUpauth = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile/" + req.user.id);
  }
  if (req.cookies.verified == "false" || !req.cookies.verified) {
    console.log("not verified");
    return res.redirect("/users/sign-up");
  }
  //req.flash("success", " Age verified > 18");
  return res.render("user_sign_up", {
    title: "iCoder | Sign Up",
  });
};

module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile/" + req.user.id);
  }

  return res.render("user_sign_in", {
    title: "iCoder | Sign In",
  });
};

module.exports.verifyEmail = async function (req, res) {
  try {
    if (req.body.password != req.body.confirm_password) {
      return res.redirect("back");
    }
    const num = await randomstring.generate();
    console.log(num);
    await sendEmail.verifyEmail(req.body.email, num);
    req.body.verify_code = num;
    userlog = req.body;
    return res.render("confirm", {
      title: "Confirm Email",
      email: req.body.email,
    });
  } catch (err) {
    console.log(err);
  }
};
module.exports.create = function (req, res) {
  if (!userlog) {
    return res.end("something went wrong");
  }
  if (req.body.code != userlog.verify_code) {
    console.log(
      "code not matched",
      req.body.code,
      userlog.verify_code,
      userlog.email
    );
    return res.end("something went wrong");
    //return res.redirect("back");
  }

  User.findOne({ email: userlog.email }, function (err, user) {
    if (err) {
      console.log("eror in finding user in signing up");
      return;
    }
    if (!user) {
      User.create(userlog, function (err, user) {
        if (err) {
          console.log("eror in Creating user in signing up");
          return;
        }
        newuser.newComment(user);
        user.avatar = User.avatarPath + "/avatar-1646916243830";

        console.log("user", user.avatar);
        user.save();
        return res.redirect("/users/sign-in");
      });
    } else {
      return res.redirect("back");
    }
  });
};

module.exports.forget_password = function (req, res) {
  return res.render("forget_password", {
    title: "Forget Password",
  });
};

module.exports.set_new_password = async function (req, res) {
  try {
    if (req.body.new_password != req.body.Confirm_password) {
      return res.send("password not matched");
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send("user with given email doesn't exist");

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: randomstring.generate(),
        password: req.body.new_password,
      }).save();
    }

    const link = `${process.env.HOST_URL}/users/reset_password/${user._id}/${token.token}`;
    await setpassword.setpassword(user.email, link);

    res.send(
      "<html><head/><body>password reset link sent to your email account <br/><b>close this tab and login again</b></body> <html>"
    );
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};

module.exports.reset_password = async function (req, res) {
  try {
    //   console.log("dddd");
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).send("invalid link or expired");

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");

    user.password = token.password;
    await user.save();
    await token.delete();

    res.send(
      `<html><head/><body>password reset sucessfully.<br/> <br/><button><a href=${process.env.HOST_URL}/users/sign-in> go to sign in page </a></button></body></html>`
    );
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
};

module.exports.createSesion = function (req, res) {
  req.flash("success", "Logged in Successfully");
  return res.redirect("/");
};

module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash("success", "You have logged Out");
  return res.redirect("/");
};

module.exports.makefriend = function (req, res) {
  User.findById(req.user.id, function (err, user) {
    if (
      !user.friends.find(function (value) {
        return value == req.params.id;
      })
    ) {
      user.friends.push(req.params.id);
      user.save();
    }
  });
  return res.redirect("back");
};
//deletefriend

module.exports.deletefriend = function (req, res) {
  User.findById(req.user.id, function (err, user) {
    if (
      user.friends.find(function (value) {
        return value == req.params.id;
      })
    ) {
      user.friends.pull(req.params.id);
      user.save();
    }
  });
  return res.redirect("back");
};

const passport = require("passport");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const mail = require("../handlers/mail");
// const User = require("../models/User");

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed Login!",
  successRedirect: "/",
  successFlash: "You are now logged in!"
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Thanks for stopping by! See ya 👋 ");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  //check to see if the user is authenticated
  if (req.isAuthenticated()) {
    next(); //person is logged in. Moving along, nothing to see here!
    return;
  }
  req.flash("error", "Opps! You must be logged in to do that!");
  res.redirect("/login");
};

exports.forgot = async (req, res) => {
  //see if user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("error", "No account with that email exists!");
    return res.redirect("/login");
  }
  //set reset token and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = Date.now() + 36000000; //1 hour from now
  await user.save();
  //send email with token
  const resetURL = `http://${req.headers.host}/account/reset/${
    user.resetPasswordToken
  }`;

  await mail.send({
    user,
    subject: 'Password Reset',
    resetURL,
    filename: 'password-reset'
  })

  req.flash("success", `You have been emailed a password reset link`);
  //redirect ot login page
  res.redirect("/login");
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash("error", "Reset password token is invalid or has expired");
    return res.redirect("/login");
  }
  res.render("reset", { title: "Reset your password" });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body["password-confirm"]) {
    next();
    return;
  }
  req.flash("error", "Passwords do not match!");
  res.redirect("back");
};

exports.updatePassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash("error", "Reset password token is invalid or has expired");
    return res.redirect("/login");
  }

  await user.setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser, function(err) {
    if (err) {
      return next(err);
    }
  });
  req.flash(
    "success",
    "Your password has been reset and you are now logged in! 👍"
  );
  res.redirect("/");
};

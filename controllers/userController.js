const mongoose = require("mongoose");
const User = require("../models/User");

//validate register data

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must provide a name!").notEmpty();
  req.checkBody("email", "The email is not valid!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extenstion: false,
    gmail_remove_subaddress: false
  });
  req.checkBody("password", "Password field cannot be empty!").notEmpty();
  req
    .checkBody("password-confirm", "Confirm password field cannot be blank!")
    .notEmpty();
  req
    .checkBody("password-confirm", "Oops! Password do not match!")
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash()
    });
    return; //stop the function from running
  }
  next(); //there were no errors. Onward!
};

// *************************** User login control *************************************
exports.userLogin = (req, res) => {
  res.render("login", { title: "Login" });
};

// ********************* User registration control ************************************
exports.register = (req, res) => {
  res.render("register", { title: "Register" });
};

exports.registerUser = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = await User.register(user, req.body.password);
  next();
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit Your Account" });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: "query" }
  );
  req.flash("success", "Profile updated successfully!");
  res.redirect("back");
};

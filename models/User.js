const mongoose = require("mongoose");
const schema = mongoose.schema;
const md5 = require("md5");
const validator = require("validator");
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invaid email address!"],
    required: "Please provide and email address"
  },
  name: {
    type: String,
    required: "Please provide a name",
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [{ type: mongoose.Schema.ObjectId, ref: "Park" }]
});

userSchema.virtual("gravatar").get(function() {
  const hash = md5(this.email);
  return `https://www.gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("User", userSchema);

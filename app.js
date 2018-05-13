const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const passport = require("passport");
const expressValidator = require("express-validator");
const routes = require("./routes/index");
const errorHandlers = require("./handlers/errorHandlers");
const helpers = require('./helper');
require("./handlers/passport");

//enviornment variables
require("dotenv").config({ path: "./variables.env" });

//create our express app
const app = express();

//loading the public dir in order to use external stylesheets, images, etc
app.use(express.static("public"));

// view engine setup
app.set("views", "./views"); // this is the folder where we keep our pug files
app.set("view engine", "pug"); // we use the engine pug, mustache or EJS work great too

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator());

app.use(
  session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
  })
);

// // Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// use connect-flash to display messages
app.use(flash());

//store flashes into locals to be displayed for comfirmation messages or errors.
app.use((req, res, next) => {
  res.locals.help = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  next();
});

//linking up the database
mongoose.connect(process.env.DATABASE);
mongoose.connection.on("error", err => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

//import our models
require("./models/Parks");
require("./models/User");
// require("./models/Review");

//handle our routes
app.use("/", routes);

//if the above routes aren't found we mark it as 404 and move along
app.use(errorHandlers.notFound);

// app.listen(process.env.PORT || 8000, (req, res) => {
//   console.log("Seems to be running!");
// });

app.listen(process.env.PORT, (req, res) => {
  console.log("Seems to be running!");
});
module.exports = app;

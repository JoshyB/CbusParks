const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const authController = require("../controllers/authController.js");
const parksController = require("../controllers/parksController.js");
const reviewController = require("../controllers/reviewController.js");

//bring in my error handler
const { catchErrors } = require("../handlers/errorHandlers");

// ****************************** User controller stuff ************************************************************

//handle the register user routes
router.get("/register", userController.register);

//1. we need to validator the registration data
//2. register the user
//3. Log them in (profit)
router.post(
  "/register",
  userController.validateRegister,
  userController.registerUser,
  authController.login
);

//handle the login routes
//gets the login page
router.get("/login", userController.userLogin);
router.post("/login", authController.login);

//handle logout
router.get("/logout", authController.logout);

//edit user account
router.get("/account", authController.isLoggedIn, userController.account);
router.post("/account", catchErrors(userController.updateAccount));

//forgot password form
router.post("/account/forgot", catchErrors(authController.forgot));

router.get("/account/reset/:token", catchErrors(authController.reset));

router.post(
  "/account/reset/:token",
  authController.confirmedPasswords,
  catchErrors(authController.updatePassword)
);

// ***************************** Park controller Stuff *********************************************

//right now, this is routes to the homepage
//TODO change to parks homepage and put this route inside of the 'parksController'
router.get("/", catchErrors(parksController.getParks));
router.get("/parks/page/:page", catchErrors(parksController.getParks));


router.get("/addPark", authController.isLoggedIn, parksController.addPark);

//add a park to the database
router.post(
  "/createPark",
  parksController.upload,
  catchErrors(parksController.resize),
  catchErrors(parksController.createPark)
);

//edit and update a park
router.post(
  "/createPark/:id",
  parksController.upload,
  catchErrors(parksController.resize),
  catchErrors(parksController.updatePark)
);

router.get("/parks/:id/edit", catchErrors(parksController.editPark));

router.get("/tags", catchErrors(parksController.getParksByTag));
router.get("/tags/:tag*?", catchErrors(parksController.getParksByTag));
router.get('/top', catchErrors(parksController.getTopParks));

router.get("/park/:slug", catchErrors(parksController.getParkBySlug));

router.post(
  "/reviews/:id",
  authController.isLoggedIn,
  catchErrors(reviewController.addReview)
);

// ************ API stuff ***************

router.get("/api/search", catchErrors(parksController.searchParks));
router.get("/api/parks/near", catchErrors(parksController.mapParks));
router.get("/map", parksController.mapPage);
router.post("/api/parks/:id/heart", catchErrors(parksController.heartPark));
router.get("/hearts", catchErrors(parksController.getHeartedParks));

module.exports = router;

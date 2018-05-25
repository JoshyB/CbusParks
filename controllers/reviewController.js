const mongoose = require("mongoose");
const Review = require("../models/Review");

exports.addReview = async (req, res) => {
  req.body.author = req.user._id;
  req.body.park = req.params.id;
  const newReview = await new Review(req.body).save();
  req.flash('success', 'Your review has been saved!');
  res.redirect('back');
};

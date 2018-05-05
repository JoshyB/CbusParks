const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply an author"
  },
  park: {
    type: mongoose.Schema.ObjectId,
    ref: "Parks",
    required: "You must supply a Park"
  },
  text: {
    type: String,
    required: "Your review must have text"
  },
  raiting: {
    type: Number,
    min: 1,
    max: 5
  }
});

function autopopulate(next) {
  this.populate("author");
  next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate)

module.exports = mongoose.model("Review", reviewSchema);

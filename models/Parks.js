const mongoose = require("mongoose");
const slug = require("slugs");

const parkSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Please enter a park name!"
    },
    slug: String,
    description: {
      type: String,
      trim: true
    },
    photo: String,
    created: {
      type: Date,
      default: Date.now
    },
    tags: [String],
    location: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: [
        {
          type: Number,
          required: "You must supply coordinates!"
        }
      ],
      address: {
        type: String,
        required: "You must supply an address!"
      }
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: "You must supply an author"
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

parkSchema.index({
  name: "text",
  description: "text"
});

parkSchema.index({ "location.coordinates": "2dsphere" });

parkSchema.pre("save", function(next) {
  if (!this.isModified("name")) {
    next();
    return;
  }
  this.slug = slug(this.name);
  next();
  return;
});

parkSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: 1 } }
  ]);
};

parkSchema.statics.getTopParks = function() {
  return this.aggregate([
    //lookup stores and populate thier review
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "park",
        as: "reviews"
      }
    },
    //filter for only items that have two or more reviews
    { $match: { "reviews.1": { $exists: true } } },
    //add and average review field
    {
      $project: {
        photo: "$$ROOT.photo",
        name: "$$ROOT.name",
        reviews: "$$ROOT.reviews",
        slug: "$$ROOT.slug",
        averageRating: { $avg: "$reviews.rating" }
      }
    },
    //sort by the new field in descending order
    { $sort: { averageRating: -1 } },
    //limit the number of reviews by 10
    { $limit: 10 }
  ]);
};

parkSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "park"
});

//TODO display number of reviews each park has on the park card

// function autopopulate(next) {
//   this.populate("reviews");
//   next();
// }

// parkSchema.pre('find', autopopulate);
// parkSchema.pre('findOne', autopopulate);


module.exports = mongoose.model("Park", parkSchema);

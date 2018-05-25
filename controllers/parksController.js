const mongoose = require("mongoose");
const Park = require("../models/Parks");
const User = require("../models/User");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

//defining some multer options
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  }
};

exports.getParks = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = page * limit - limit;

  const parksPromise = Park.find()
    .skip(skip)
    .limit(limit);

  const countPromise = Park.count();

  const [parks, count] = await Promise.all([parksPromise, countPromise]);

  const pages = Math.ceil(count / limit);

  if (!parks.length && skip) {
    req.flash(
      "success",
      `You requested a page number that doesn't exist, so I put you on page ${pages}`
    );
    res.redirect(`parks/page${pages}`);
    return;
  }

  res.render("parks", { title: "Parks", parks, page, pages, count });
};

exports.addPark = (req, res) => {
  res.render("editPark", { title: "Add a park" });
};

//handle photo uploads
exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if (!req.file) {
    next();
    return;
  } else {
    const extension = req.file.mimetype.split("/")[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    next();
  }
};

exports.createPark = async (req, res) => {
  req.body.author = req.user._id;
  const park = await new Park(req.body).save(err => console.log(err));
  // res.json(req.body)
  req.flash("success", "You have successfully added a park");
  res.redirect("/");
};

//function that determains if the user is in fact the park owner
const confirmOwner = (park, user) => {
  if (!park.author.equals(user._id)) {
    throw Error("You must be the creator of the park in order to edit it!");
  }
};

exports.editPark = async (req, res) => {
  const park = await Park.findOne({ _id: req.params.id });
  //confirm they are the owner of the park
  confirmOwner(park, req.user);

  res.render("editPark", { title: `Edit ${park.name}`, park });
};

exports.updatePark = async (req, res) => {
  const park = await Park.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true
  }).exec();
  req.flash("success", `You have successfully edited ${park.name}`);
  res.redirect("/");
};

exports.getParksByTag = async (req, res) => {
  const tag = req.params.tag;
  const parkQuery = tag || { $exists: true };
  const tagsPromise = Park.getTagsList();
  const parkPromise = Park.find({ tags: parkQuery });
  const [tags, parks] = await Promise.all([tagsPromise, parkPromise]);
  res.render("tags", { tags, title: "Tags", tag, parks });
};

exports.getParkBySlug = async (req, res, next) => {
  const park = await Park.findOne({ slug: req.params.slug }).populate(
    "author reviews"
  );
  if (!park) return next();
  res.render("park", { park, title: park.name });
};

exports.searchParks = async (req, res) => {
  const park = await Park.find(
    { $text: { $search: req.query.q } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(5);
  res.json(park);
};

exports.mapParks = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);

  const q = {
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates
        },
        $maxDistance: 25000 //10km
      }
    }
  };
  const parks = await Park.find(q).select(
    "slug name photo description location"
  );
  res.json(parks);
};

exports.mapPage = async (req, res) => {
  res.render("map", { title: "Map" });
};

exports.heartPark = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? "$pull" : "$addToSet";
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  );
  res.json(user);
};

exports.getHeartedParks = async (req, res) => {
  const parks = await Park.find({
    _id: { $in: req.user.hearts }
  });
  res.render("parks", { title: "Hearted Parks", parks });
};

exports.getTopParks = async (req, res) => {
  const parks = await Park.getTopParks();
  res.render("topParks", { title: "⭐️ Top Parks", parks });
};

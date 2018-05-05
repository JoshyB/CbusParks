exports.staticMap = ([lng, lat]) =>
  `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x150&key=${
    process.env.MAP_KEY
  }&markers=${lat},${lng}&scale=2`;

exports.moment = require("moment");

exports.icon = (icon) => {return '<i class="far fa-' + icon + '"></i>'};
exports.iconSolid = (iconSolid) => {return '<i class="fas fa-' + iconSolid + '"></i>'};


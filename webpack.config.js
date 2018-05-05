const path = require("path");

const config = {
  entry: {
    // we only have 1 entry, but I've set it up for multiple in the future
    App: "./public/javascript/park-app.js"
  },
  output: {
    // path is a built in node module
    // __dirname is a variable from node that gives us the
    path: path.resolve(__dirname, "public", "dist"),
    // we can use "substitutions" in file names like [name] and [hash]
    // name will be `App` because that is what we used above in our entry
    filename: "[name].bundle.js"
  }
};

module.exports = config;

// module.exports = {
//     entry: './app.js',
//     output: {
//         path: './public/dist/',
//         output: 'bundle.js'
//     }
// }

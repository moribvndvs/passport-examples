const mongoose = require('mongoose');

module.exports = function() {
  // If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
  var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/passport-examples";

  // Configure mongoose to use Promises, because callbacks are passe.
  mongoose.Promise = global.Promise;
  // Connect to the Mongo DB
  return mongoose.connect(MONGODB_URI);
}

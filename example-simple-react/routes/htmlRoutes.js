const express = require('express');
const path = require("path");
const router = express.Router();

// Serve up static assets (usually on heroku)
router.use(express.static("client/build"));

// Send every request to the React app
// Define any API routes before this runs
router.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});


module.exports = router;


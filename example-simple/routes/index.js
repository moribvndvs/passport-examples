const express = require('express');

const router = express.Router();

// add HTML routes to current router
router.use(require('./htmlRoutes'));

module.exports = router;

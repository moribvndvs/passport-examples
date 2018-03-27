const express = require('express');
const passport = require('passport');
const db = require('../../shared/models');
const router = express.Router();

// shows the home view. if the user is logged in, their User record is available at req.user
router.get('/', (req, res) => {
  res.render('home', {
    user: req.user
  });
});

// simply shows the login view.
router.get('/login', (req, res) => {
  res.render('login', {
    flash: req.flash('error')
  });
});

// configures this route to authenticate the request against the "local" strategy
// if they authenticate correcty, it'll redirect back to the home page. if they do not
// it'll send them back to the login page.
router.post(
  '/login',
  passport.authenticate(
    'local',
    {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true
    }
  )
);

// logs the user out and destroys their current session, then sends them back to the homepage
router.get('/logout', (req, res) => {
  // logs the user out
  req.logout();
  // destroys their session completely
  req.session.destroy();
  res.redirect('/');
});

// shows the create view.
router.get('/create', (req, res) => {
  res.render('create', {
    flash: req.flash('error')
  });
});

// when a user submits a new user, this will create the account.
router.post('/create', (req, res, next) => {
  const user = new db.User(req.body);
  user.save(req.body)
    .then(req => {
      res.redirect('/login');
    })
    .catch(err => {
      // if this error code is thrown, that means the username already exists.
      // let's handle that nicely by redirecting them back to the create screen
      // with that flash message
      if (err.code === 11000) {
        req.flash("error", "That username is already in use.");
        return res.redirect('/create');
      }

      // otherwise, it's some nasty unexpected error, so we'll just send it off to
      // to the next middleware to handle the error.
      next(err);
    });
});

module.exports = router;


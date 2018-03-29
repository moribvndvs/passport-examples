const express = require('express');
const axios = require('axios');
const passport = require('passport');
const router = express.Router();
const db = require('../../shared/models');
const mustBeLoggedIn = require('../../shared/middleware/mustBeLoggedIn');
const mongoose = require('mongoose');
const Twitter = require('twitter');

async function getCurrentUser(req, res) {
  // I'm picking only the specific fields its OK for the audience to see publicly
  // never send the whole user object in the response, and only show things it's OK
  // for others to read (like ID, name, email address, etc.)
  const { id, username } = req.user;

  // i'm also gonna return the names of any social media memberships they have
  // in case the UI wants to do anything useful with that information
  const memberships = await db.SocialMediaMembership
    .find({userId: new mongoose.Types.ObjectId(id) });

  res.json({
    id, username,
    memberships: memberships.map(m => m.provider)
  });
}

router.route('/auth')
  // GET to /api/auth will return current logged in user info
  .get((req, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'You are not currently logged in.'
      })
    }

    getCurrentUser(req, res);
  })
  // POST to /api/auth with username and password will authenticate the user
  .post(passport.authenticate('local'), (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      })
    }

    getCurrentUser(req, res);
  })
  // DELETE to /api/auth will log the user out
  .delete((req, res) => {
    req.logout();
    req.session.destroy();
    res.json({
      message: 'You have been logged out.'
    });
  });

router.route('/users')
  // POST to /api/users will create a new user
  .post((req, res, next) => {
    db.User.create(req.body)
      .then(user => {
        const { id, username } = user;
        res.json({
          id, username, memberships: []
        });
      })
      .catch(err => {
        // if this error code is thrown, that means the username already exists.
        // let's handle that nicely by redirecting them back to the create screen
        // with that flash message
        if (err.code === 11000) {
          res.status(400).json({
            message: 'Username already in use.'
          })
        }

        // otherwise, it's some nasty unexpected error, so we'll just send it off to
        // to the next middleware to handle the error.
        next(err);
      });
  });

// this route is just returns an array of strings if the user is logged in
// to demonstrate that we can ensure a user must be logged in to use a route
router.route('/stuff')
  .get(mustBeLoggedIn(), (req, res) => {
    // at this point we can assume the user is logged in. if not, the mustBeLoggedIn middleware would have caught it
    res.json([
      'Bears',
      'Beets',
      'Battlestar Galactica'
    ]);
  });

// example route for accessing a spotify user's playlists. the user must
// have logged in with spotify in order for this to work!
router.route('/playlists')
  .get(mustBeLoggedIn(), async (req, res, next) => {
    try {
      const membership = await db.SocialMediaMembership
        .findAccessToken(req.user.id, 'spotify');

      // send an error if we can't find an access token for spotify
      // they probably didn't log in using spotify
      if (!membership) {
        return res.status(403).json({
          message: 'You must log in using Spotify to access this resource.'
        });
      }

      // fetching the user's playlists
      const results = await axios.get('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${membership.accessToken}`
        }
      });

      res.json(results.data);
    } catch (err) {
      next(err);
    }
  });


  // example route for accessing a twitter user's recent tweets. the user must
// have logged in with twitter in order for this to work!
router.route('/tweets')
  .get(mustBeLoggedIn(), async (req, res, next) => {
    try {
      const membership = await db.SocialMediaMembership
        .findAccessToken(req.user.id, 'twitter');

      // send an error if we can't find an access token for Twitter
      // they probably didn't log in using Twitter
      if (!membership) {
        return res.status(403).json({
          message: 'You must log in using Twitter to access this resource.'
        });
      }

      const twitter = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: membership.token,
        access_token_secret: membership.tokenSecret
      });

      const results = await twitter.get('statuses/user_timeline', {
        user_id: membership.providerUserId
      });

      res.json(results);
    } catch (err) {
      next(err);
    }
  });


module.exports = router;


const session = require('express-session');
const cookieparser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const db = require('../shared/models');

// export a function that receives the Express app we will configure for Passport
module.exports = (app) => {
  // these two middlewares are required to make passport work with sessions
  // sessions are optional, but an easy solution to keeping users
  // logged in until they log out.
  app.use(cookieparser());
  app.use(session({
    // this should be changed to something cryptographically secure for production
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    // automatically extends the session age on each request. useful if you want
    // the user's activity to extend their session. If you want an absolute session
    // expiration, set to false
    rolling: true,
    name: 'sid', // don't use the default session cookie name
    // set your options for the session cookie
    cookie: {
      httpOnly: true,
      // the duration in milliseconds that the cookie is valid
      maxAge: 20 * 60 * 1000, // 20 minutes
      // recommended you use this setting in production if you have a well-known domain you want to restrict the cookies to.
      // domain: 'your.domain.com',
      // recommended you use this setting in production if your site is published using HTTPS
      // secure: true,
    }
  }));

  // Only necessary when using sessions.
  // This tells Passport how or what data to save about a user in the session cookie.
  // It's recommended you only serialize something like a unique username or user ID.
  // I prefer user ID.
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Only necessary when using sessions.
  // This tells Passport how to turn the user ID we serialize in the session cookie
  // back into the actual User record from our Mongo database.
  // Here, we simply find the user with the matching ID and return that.
  // This will cause the User record to be available on each authenticated request via the req.user property.
  passport.deserializeUser(function (userId, done) {
    db.User.findById(userId)
      .then(function (user) {
        done(null, user);
      })
      .catch(function (err) {
        done(err);
      });
  });

  // this tells passport to use the "local" strategy, and configures the strategy
  // with a function that will be called when the user tries to authenticate with
  // a username and password. We simply look the user up, hash the password they
  // provided with the salt from the real password, and compare the results. if
  // the original and current hashes are the same, the user entered the correct password.
  passport.use(new LocalStrategy((username, password, done) => {
    const errorMsg = 'Invalid username or password';

    db.User.findOne({ username })
      .then(user => {
        // if no matching user was found...
        if (!user) {
          return done(null, false, { message: errorMsg });
        }

        // call our validate method, which will call done with the user if the
        // passwords match, or false if they don't
        return user.validatePassword(password)
          .then(isMatch => done(null, isMatch ? user : false, isMatch ? null : { message: errorMsg }));
      })
      .catch(done);
  }));

  // this tells passport that we also support a "spotify" strategy.
  // in this case, we tell it how to find a User that has a socialMedia entry
  // of type "spotify" that has the same profile ID of the spotify account
  // they used to log in.
  passport.use(new SpotifyStrategy(
    {
      // the client ID spotify assigned to your app
      clientID: process.env.SPOTIFY_CLIENT_ID,
      // the secret spotify assigned to your app
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      // the path spotify will call back to once the user has logged in.
      // We'll define this route in routes/htmlRoutes.js
      callbackURL: `${process.env.APP_BASE_URL}/auth/spotify/callback`,
      // The minimum scopes you'll need to read the user's
      // full name and email address are 'user-read-private', 'user-read-email'.
      // If you want to do more than that,
      // like actually read the user's Spotify data via their API,
      // you need to tell Spotify what data you wish to access via scopes
      // See: https://developer.spotify.com/web-api/using-scopes/
      scope: [
        'user-read-private', 'user-read-email',
        'playlist-read-private', 'playlist-read-collaborative'
      ]
    },
    // i'm using async/await with promises to keep my code readable
    // you can stick with plain old promises if you'd like (whyyyy??)
    async (accessToken, refreshToken, expires_in, profile, done) => {
      // we'll need these later
      let user;
      let membership;

      try {
        // first, try to find the user that is connected to this spotify user
        // i'm using findOneAndUpdate so that if the membership already exists,
        // we just update their access token which will periodically expire
        membership = await db.SocialMediaMembership.findOneAndUpdate({
          provider: 'spotify',
          providerUserId: profile.id
        }, {
          accessToken, // you'll typically want to encrypt these before storing db
          refreshToken // encrypt me, too!
        })
        // need the fully populated user for this membership, this is important!
        .populate('userId');
      } catch (err) {
        // you need to let the strategy know if there was an error!
        return done(err, null);
      }

      if (!membership) {
        try {
          // no user with this spotify account is on file,
          // so create a new user and membership for this spotify user
          user = await db.User.create({
            username: profile.username
          });
          membership = await db.SocialMediaMembership.create({
            provider: 'spotify',
            providerUserId: profile.id,
            accessToken,
            refreshToken,
            userId: user.id
          });
        } catch (err) {
          return done(err, null);
        }
      } else {
        // get the user from the membership
        user = membership.userId;
      }

      // tell the strategy we found the user
      done(null, user);
    }
  ));

  // this tells passport that we also support a "twitter" strategy.
  // in this case, we tell it how to find a User that has a socialMedia entry
  // of type "twitter" that has the same profile ID of the twitter account
  // they used to log in.
  passport.use(new TwitterStrategy(
    {
      // the consumerKey twitter assigned to your app
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      // the secret twitter assigned to your app
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      // the path twitter will call back to once the user has logged in.
      // We'll define this route in routes/htmlRoutes.js
      callbackURL: `${process.env.APP_BASE_URL}/auth/twitter/callback`
    },
    // i'm using async/await with promises to keep my code readable
    // you can stick with plain old promises if you'd like (whyyyy??)
    async (token, tokenSecret, profile, done) => {
      // we'll need these later
      let user;
      let membership;

      try {
        // first, try to find the user that is connected to this twitter user
        // i'm using findOneAndUpdate so that if the membership already exists,
        // we just update their access token which will periodically expire
        membership = await db.SocialMediaMembership.findOneAndUpdate({
          provider: 'twitter',
          providerUserId: profile.id
        }, {
          token, // you'll typically want to encrypt these before storing db
          tokenSecret
        })
        // need the fully populated user for this membership, this is important!
        .populate('userId');
      } catch (err) {
        // you need to let the strategy know if there was an error!
        return done(err, null);
      }

      if (!membership) {
        try {
          // no user with this twitter account is on file,
          // so create a new user and membership for this twitter user
          user = await db.User.create({
            username: profile.username
          });
          membership = await db.SocialMediaMembership.create({
            provider: 'twitter',
            providerUserId: profile.id,
            token,
            tokenSecret,
            userId: user.id
          });
        } catch (err) {
          return done(err, null);
        }
      } else {
        // get the user from the membership
        user = membership.userId;
      }

      // tell the strategy we found the user
      done(null, user);
    }
));

  // initialize passport. this is required, after you set up passport but BEFORE you use passport.session (if using)
  app.use(passport.initialize());
  // only required if using sessions. this will add middleware from passport
  // that will serialize/deserialize the user from the session cookie and add
  // them to req.user
  app.use(passport.session());
}

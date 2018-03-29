const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// bcrypt is the hashing algorithm we'll use to protect stored credentials.
// NEVER STORE PASSWORDS OR OTHER SENSITIVE DATA AS PLAIN TEXT!!!
const bcrypt = require('bcrypt');

// TL;DNR: this determines how expensive it is to generate the hash
// as average computing power grows, you'll increase this number
// to make it prohibitively expensive for someone who has stolen
// your hashed passwords to crack those hashed passwords. Don't make
// this value so high it takes forever to log in or sign up, but don't
// a potential hacker's job easy.
// See: https://codahale.com/how-to-safely-store-a-password/
const WORK_FACTOR = 10;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: { unique: true }
  },
  password: {
    type: String
  }
});

// This pre "save" handler will be called before each time the user is saved.
// it will convert the plaintext password into a securely hashed version so that
// the original plaintext password is never stored in the database

// NOTE: do NOT use an arrow function for the second argument
// Mongoose passes in the instance being saved via "this",
// but arrow functions preserve "this" as the bound context
// if you use an arrow function, you'll get an error
// "user.isModified is not a function"
UserSchema.pre('save', function(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      user.password = hash;
      // let mongoose know we're done now that we've hashed the plaintext password
      next();
    });
  });
});

// Here, we define a method that will be available on each instance of the User.
// This method will validate a given password with the actual password, and resolve
// true if the password is a match, or false if it is not.
// This code returns a Promise rather than using the callback style
UserSchema.methods.validatePassword = function (candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};

const User = mongoose.model('User', UserSchema);

module.exports = User;

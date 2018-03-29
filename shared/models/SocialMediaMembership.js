const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const SocialMediaMembershipSchema = new Schema({
  provider: {
    type: String,
    required: true
  },
  providerUserId: {
    type: String,
    required: true
  },
  // used in this example by Spotify to store the access and refresh tokens they give you
  accessToken: String,
  refreshToken: String,
  // used in this example by Twitter, who doesn't give you a direct access token :(
  token: String,
  tokenSecret: String,
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now,
    required: true
  }
});

// here's a static method to find the membership given user and social media provider
// this is only necessary if you want to actually use the membership info to access the social
// media site's APIs on behalf of the user.
SocialMediaMembershipSchema.statics.findAccessToken = async function(userId, provider) {
  const membership = await this.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    provider
  });

  return membership;
};

const SocialMediaMembership = mongoose.model('SocialMediaMembership', SocialMediaMembershipSchema);

module.exports = SocialMediaMembership;

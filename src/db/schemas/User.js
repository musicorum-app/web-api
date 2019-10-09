const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const TwitterAccount = new mongoose.Schema({
  id: String,
  accessToken: String,
  accessSecret: String
})

const LastfmAccount = new mongoose.Schema({
  sessionKey: String
})

const User = new mongoose.Schema({
  twitter: TwitterAccount,
  lastfm: LastfmAccount
})

User.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_TOKEN)
}

module.exports = mongoose.model('User', User)
module.exports.TwitterAccount = mongoose.model('TwitterAccount', TwitterAccount)
module.exports.LastfmAccount = mongoose.model('LastfmAccount', LastfmAccount)

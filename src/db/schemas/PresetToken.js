const mongoose = require('mongoose')

const PresetToken = new mongoose.Schema({
  slug: String,
  user: String,
  token: String
})

module.exports = mongoose.model('PresetToken', PresetToken)

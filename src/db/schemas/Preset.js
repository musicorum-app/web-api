const mongoose = require('mongoose')

const Preset = new mongoose.Schema({
  slug: String,
  user: String,
  theme: String,
  options: Object
})

module.exports = mongoose.model('Preset', Preset)

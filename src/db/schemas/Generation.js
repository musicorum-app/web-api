const mongoose = require('mongoose')

const Generation = new mongoose.Schema({
  theme: String,
  timestamp: String,
  duration: String,
  status: String,
  source: String
})

module.exports = mongoose.model('Generation', Generation)

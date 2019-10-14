const mongoose = require('mongoose')

const Run = new mongoose.Schema({
  schedule: String,
  startTime: Date,
  endTime: Date,
  image: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'ERROR']
  },
  message: String,
  tweetId: String
})

module.exports = mongoose.model('Run', Run)

const mongoose = require('mongoose')

const Scheduler = new mongoose.Schema({
  user: String,
  schedule: {
    type: String,
    enum: ['MONTHY', 'WEEKLY']
  },
  time: Number,
  timezone: String,
  theme: String,
  themeOptions: Object
})

module.exports = mongoose.model('Scheduler', Scheduler)

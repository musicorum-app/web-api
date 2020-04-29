const mongoose = require('mongoose')

const Schedule = new mongoose.Schema({
  name: String,
  schedule: {
    type: String,
    enum: ['MONTHLY', 'WEEKLY']
  },
  time: Number,
  day: Number,
  timezone: String,
  text: String,
  theme: {
    type: String,
    enum: ['grid', 'tops', 'duotone', 'darkly']
  },
  themeOptions: Object
})

module.exports = Schedule

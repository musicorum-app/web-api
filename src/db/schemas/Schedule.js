const mongoose = require('mongoose')

const Schedule = new mongoose.Schema({
  name: String,
  schedule: {
    type: String,
    enum: ['MONTHY', 'WEEKLY']
  },
  time: Number,
  timezone: String,
  text: String,
  theme: {
    type: String,
    enum: ['grid', 'tops']
  },
  themeOptions: Object
})

module.exports = Schedule

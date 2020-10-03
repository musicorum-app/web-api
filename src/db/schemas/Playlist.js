const mongoose = require('mongoose')

const PlaylistItem = new mongoose.Schema({
  name: String,
  artist: String,
  image: String,
  url: String,
  spotify: String,
  deezer: String,
  youtube: String
})

const Playlist = new mongoose.Schema({
  _id: { type: String },
  name: String,
  created_at: Number,
  type: String,
  user: String,
  image: {
    cdn: String,
    path: String
  },
  presentation: String,
  description: String,
  service_description: String,
  items: [String]
}, { _id: false })

module.exports.PlaylistItem = mongoose.model('PlaylistItem', PlaylistItem)
module.exports.Playlist = mongoose.model('Playlist', Playlist)

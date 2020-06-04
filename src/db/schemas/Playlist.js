const mongoose = require('mongoose')

const PlaylistItem = new mongoose.Schema({
  name: String,
  artist: String,
  image: String,
  url: String,
  spotifyId: String,
  deezerId: String,
  youtubeId: String
})

const Playlist = new mongoose.Schema({
  _id: { type: String },
  name: String,
  createdAt: Number,
  type: String,
  user: String,
  image: String,
  presentation: String,
  description: String,
  items: [PlaylistItem]
}, { _id: false })

module.exports.PlaylistItem = mongoose.model('PlaylistItem', PlaylistItem)
module.exports.Playlist = mongoose.model('Playlist', Playlist)

const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()
const { CacheBridge } = require('../utils')
const ResourceManagerAPI = require('../apis/ResourceManager.js')
const Sentry = require('@sentry/node')

const API_URL = 'https://api.spotify.com/v1'

Sentry.init({ dsn: process.env.SENTRY_DSN })

module.exports = (musicorum) => {
  router.post('/tracks', async (req, res) => {
    try {
      if (!req.body.tracks) return res.status(400).json(messages.MISSING_PARAMETERS)
      const { tracks } = req.body
      if (!Array.isArray(tracks)) return res.status(400).json(messages.MISSING_PARAMETERS)

      const trackList = await ResourceManagerAPI.fetchTracks(tracks)

      const ids = trackList.filter(a => a).map(t => t.spotify)

      const result = await musicorum.spotify.request(`${API_URL}/tracks?ids=${ids.join()}&market=US`)

      console.log(result)
      console.log(`${API_URL}/tracks?ids=${ids.join()}`)

      res.json(result.tracks.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        cover: track.album.images[0].url,
        preview: track.preview_url
      })))
    } catch (e) {
      console.error(e)
      res.status(500).json(messages.INTERNAL_ERROR)
    }
  })

  router.post('/artists', async (req, res) => {
    try {
      if (!req.body.artists) return res.status(400).json(messages.MISSING_PARAMETERS)
      const { artists } = req.body
      if (!Array.isArray(artists)) return res.status(400).json(messages.MISSING_PARAMETERS)

      const list = await ResourceManagerAPI.fetchArtists(artists)

      console.log(list)

      const ids = list.filter(a => a).map(t => t.spotify)

      const result = await musicorum.spotify.request(`${API_URL}/artists?ids=${ids.join()}`)

      res.json(result.artists.map(artist => ({
        name: artist.name,
        popularity: artist.popularity,
        image: artist.images[0].url
      })))
    } catch (e) {
      // console.error(e)
      res.status(500).json(messages.INTERNAL_ERROR)
    }
  })

  router.get('/tracks/this-not-working', async (req, res) => {
    try {
      if (!req.body.tracks) return res.status(400).json(messages.MISSING_PARAMETERS)
      let { tracks } = req.body

      if (!Array.isArray(tracks)) return res.status(400).json(messages.MISSING_PARAMETERS)

      tracks = tracks.filter(t => t.name && t.artist)

      if (!tracks.length) return res.status(400).json(messages.MISSING_PARAMETERS)

      const list = await CacheBridge.fetchTracksIDs(tracks)

      const spResult = await musicorum.spotify.request(`${API_URL}/audio-features?ids=${list.tracks.join()}`)

      res.json(spResult.audio_features.map(t => ({
        id: t.id,
        danceability: t.danceability,
        energy: t.energy,
        tempo: t.tempo,
        valence: t.valence
      })))
    } catch (e) {
      console.error(e)
      res.status(500).json(messages.INTERNAL_ERROR)
    }
  })

  return router
}

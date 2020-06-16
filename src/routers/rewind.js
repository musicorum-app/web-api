const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()
const { CacheBridge } = require('../utils')
const Sentry = require('@sentry/node')

const API_URL = 'https://api.spotify.com/v1'

Sentry.init({ dsn: process.env.SENTRY_DSN })

module.exports = (musicorum) => {
  router.get('/artists', async (req, res) => {
    try {
      if (!req.body.artists) return res.status(400).json(messages.MISSING_PARAMETERS)
      const { artists } = req.body
      if (!Array.isArray(artists)) return res.status(400).json(messages.MISSING_PARAMETERS)

      const list = await CacheBridge.fetchArtistsIDs(req.body.artists)
      console.log(list)

      const spResult = await musicorum.spotify.request(`${API_URL}/artists?ids=${list.artists.join()}`)

      res.json(spResult.artists.map(a => ({
        name: a.name,
        images: a.images,
        uri: a.uri,
        id: a.id
      })))
    } catch (e) {
      console.error(e)
      res.status(500).json(messages.INTERNAL_ERROR)
    }
  })

  router.get('/tracks', async (req, res) => {
    try {
      if (!req.body.tracks) return res.status(400).json(messages.MISSING_PARAMETERS)
      let { tracks } = req.body

      if (!Array.isArray(tracks)) return res.status(400).json(messages.MISSING_PARAMETERS)

      tracks = tracks.filter(t => t.name && t.artist)

      if (!tracks.length) return res.status(400).json(messages.MISSING_PARAMETERS)

      const list = await CacheBridge.fetchTracksIDs(tracks)

      const spResult = await musicorum.spotify.request(`${API_URL}/tracks?ids=${list.tracks.join()}`)

      console.log(spResult.tracks[0])

      res.json(spResult.tracks.map(t => ({
        id: t.id,
        uri: t.uri,
        name: t.name,
        album: {
          name: t.album.name,
          images: t.album.images
        },
        duration: t.duration_ms,
        popularity: t.popularity
      })))
    } catch (e) {
      console.error(e)
      res.status(500).json(messages.INTERNAL_ERROR)
    }
  })

  return router
}

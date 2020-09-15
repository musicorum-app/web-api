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

      const ids = trackList.map(t => t ? t.spotify : null)

      const spResult = await musicorum.spotify.request(`${API_URL}/tracks?ids=${ids.filter(a => a).join()}&market=US`)
      const audioFeatures = await musicorum.spotify.request(`${API_URL}/audio-features?ids=${ids.filter(a => a).join()}&market=US`)
        .then(r => r.audio_features)

      const result = ids
        .map(i => i ? spResult.tracks.find(t => t.id === i) : null)
        .map(t => t ? { track: t, audio: audioFeatures.find(a => a.id === t.id) } : null)

      res.json(result.map(r => r ? {
        id: r.track.id,
        name: r.track.name,
        artist: r.track.artists[0].name,
        album: r.track.album.name,
        cover: r.track.album.images[0].url,
        preview: r.track.preview_url,
        analysis: {
          tempo: r.audio.tempo,
          danceability: r.audio.danceability,
          valence: r.audio.valence
        }
      } : null))
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

      const ids = list.map(t => t ? t.spotify : null)

      const spResult = await musicorum.spotify.request(`${API_URL}/artists?ids=${ids.filter(a => a).join()}&market=US`)

      const result = ids.map(i => i ? spResult.artists.find(t => t.id === i) : null)

      res.json(result.map(artist => artist ? {
        name: artist.name,
        popularity: artist.popularity,
        image: artist.images[0].url
      } : null))
    } catch (e) {
      console.error(e)
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

      const spResult = await musicorum.spotify.request(`${API_URL}/audio-features?ids=${list.tracks.join()}&market=US`)

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

const PlaylistJoi = require('../joi/playlist.js')
const { PlaylistItem, Playlist } = require('../db/schemas/Playlist.js')
const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()
const { CacheBridge, MiscUtils, FormatterUtils } = require('../utils')
const Sentry = require('@sentry/node')
const presentations = require('../assets/presentations.json')
const GeneratorAPI = require('../apis/Generator.js')
const DeezerAPI = require('../apis/Deezer.js')
const ResourceManagerAPI = require('../apis/ResourceManager.js')
const fetch = require('node-fetch')

Sentry.init({ dsn: process.env.SENTRY_DSN })

module.exports = (musicorum) => {
  router.get('/', async (req, res) => {
    const playlists = await Playlist.find({})

    res.json({
      playlists: playlists.map(a => a._id)
    })
  })

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params

      const foundPlaylist = await Playlist.findOne({ _id: id })

      if (!foundPlaylist) return res.status(404).json(messages.NOT_FOUND)

      const playlist = FormatterUtils.formatPlaylist(foundPlaylist._doc)

      const items = await ResourceManagerAPI.fetchTracks(playlist.items, true)
      console.log(items)
      playlist.items = playlist.items.map((item, index) => ({
        ...item,
        ...items[index]
      }))

      res.json(playlist)
    } catch (e) {
      console.error(e)
      res.status(500).json(messages.INTERNAL_ERROR)
    }
  })

  router.post('/', async (req, res) => {
    try {
      const { body } = req

      await PlaylistJoi.validateAsync(body)

      const playlistItems = []

      if (['TOP_TRACKS', 'LOVED_TRACKS'].includes(body.type)) {
        const { items } = body

        const tracks = await ResourceManagerAPI.fetchTracks(items, true)

        for (const track of tracks) {
          if (!track) continue

          playlistItems.push(new PlaylistItem({
            name: track.name,
            artist: track.artist
          }))
        }
      } else {
        return res.status(501).json(messages.NOT_IMPLEMENTED)
      }

      const upload = await GeneratorAPI.uploadCover(body.user, body.user_image)
      const id = MiscUtils.generateRandomString(8, true)

      const newPlaylist = new Playlist({
        _id: id,
        created_at: new Date().getTime(),
        type: body.type,
        user: body.user,
        image: {
          cdn: 'CDN-1',
          path: upload.uploadedFiles[0].name
        },
        presentation: body.presentation,
        items: playlistItems
      })

      await newPlaylist.save()

      res.json(FormatterUtils.formatPlaylist(newPlaylist._doc))
    } catch (e) {
      console.error(e)
      if (e.details) {
        return res.status(400).json({
          error: 'INVALID_ARGUMENTS',
          details: e.details
        })
      }
      res.status(500).json(messages.INTERNAL_ERROR)
    }
  })

  router.get('/deezer/me', async (req, res) => {
    const token = req.headers.authorization

    console.log(token)

    res.json(await DeezerAPI.getAuthenticatedProfile(token))
  })

  router.post('/deezer', async (req, res) => {
    try {
      const token = req.headers.authorization

      const { id } = await DeezerAPI.createPlaylist(token, req.body.name)

      const songs = req.body.items.filter(i => !!i.deezer).map(i => i.deezer)
      const tracksAdd = await DeezerAPI.addTracksToPLaylist(token, id, songs)
      if (tracksAdd.error) {
        console.error(tracksAdd)
      }

      const buff = await fetch(req.body.image)
        .then(r => r.buffer())

      await DeezerAPI.updatePlaylistImage(token, id, buff)

      res.json({
        id
      })
    } catch (e) {
      res.error(e)
    }
  })

  return router
}

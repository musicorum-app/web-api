const LFM = require('lastfm-node-client')
const PlaylistJoi = require('../joi/playlist.js')
const { PlaylistItem, Playlist } = require('../db/schemas/Playlist.js')
const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()
const { CacheBridge, MiscUtils } = require('../utils')
const Sentry = require('@sentry/node')

Sentry.init({ dsn: process.env.SENTRY_DSN })

module.exports = (musicorum) => {
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params
      console.log(req.params)

      const foundPlaylist = await Playlist.findOne({ _id: id })

      if (!foundPlaylist) return res.status(404).json(messages.NOT_FOUND)

      const playlist = { ...foundPlaylist._doc }
      delete playlist._id
      delete playlist.__v
      res.json({
        id: foundPlaylist._doc._id,
        ...playlist
      })
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

      if (body.type === 'TOP_ARTIST') {
        const artists = body.items.map(a => a.name)
        const spotifyIds = await CacheBridge.fetchArtistsIDs(artists)
        const [spotifyArtists, deezerArtists, youtubeChannels] = await Promise.all([
          musicorum.spotify.getArtists(spotifyIds.artists),
          CacheBridge.getArtistsFromDeezer(artists)
          // CacheBridge.getArtistsFromYoutube(artists)
        ])
        console.log(youtubeChannels)

        spotifyArtists.artists.forEach((artist, i) => {
          playlistItems.push(new PlaylistItem({
            name: artists[i],
            spotifyId: artist.id || null,
            deezerId: deezerArtists[i] ? deezerArtists[i].id : null
            // youtubeId: youtubeChannels[i] ? youtubeChannels[i].id.channelId : null
          }))
        })
      }

      const newPlaylist = new Playlist({
        _id: MiscUtils.generateRandomString(8, true),
        name: `${body.user} 2020 on music`,
        createdAt: new Date().getTime(),
        type: body.type,
        user: body.user,
        image: 'a',
        presentation: body.presentation,
        description: 'desczinha',
        items: playlistItems
      })

      await newPlaylist.save()

      const playlist = { ...newPlaylist._doc }
      delete playlist._id
      delete playlist.__v
      res.json({
        id: newPlaylist._doc._id,
        ...playlist
      })
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

  return router
}

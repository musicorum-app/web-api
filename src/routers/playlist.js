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

      res.json(FormatterUtils.formatPlaylist(foundPlaylist._doc))
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
        const [spotifyArtists, deezerArtists] = await Promise.all([
          musicorum.spotify.getArtists(spotifyIds.artists),
          CacheBridge.getArtistsFromDeezer(artists)
          // CacheBridge.getArtistsFromYoutube(artists)
        ])

        spotifyArtists.artists.forEach((artist, i) => {
          let image = 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
          const deezerArtist = deezerArtists[i]
          if (artist && artist.images.length) image = artist.images[1].url
          else if (deezerArtist && deezerArtist.cover_big) image = deezerArtist.cover_big
          playlistItems.push(new PlaylistItem({
            name: artists[i],
            url: body.items[i].url,
            spotifyId: artist.id || null,
            deezerId: deezerArtist ? deezerArtist.id : null,
            image
            // youtubeId: youtubeChannels[i] ? youtubeChannels[i].id.channelId : null
          }))
        })
      } else if (['TOP_TRACK', 'LOVED_TRACK'].includes(body.type)) {
        const { items } = body
        const spotifyIds = await CacheBridge.fetchTracksIDs(body.items)
        const [spotifyTracks, deezerTracks] = await Promise.all([
          musicorum.spotify.getTracks(spotifyIds.tracks),
          CacheBridge.getTracksFromDeezer(body.items)
          // CacheBridge.getArtistsFromYoutube(artists)
        ])

        spotifyTracks.tracks.forEach((artist, i) => {
          let image = 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
          const deezerTrack = deezerTracks[i]
          if (artist && artist.album.images.length) image = artist.album.images[1].url
          else if (deezerTrack && deezerTrack.album.cover_big) image = deezerTrack.album.cover_big
          playlistItems.push(new PlaylistItem({
            name: items[i].name,
            artist: items[i].artist,
            url: items[i].url,
            spotifyId: artist.id || null,
            deezerId: deezerTrack ? deezerTrack.id : null,
            image
            // youtubeId: youtubeChannels[i] ? youtubeChannels[i].id.channelId : null
          }))
        })
      } else {
        return res.status(501).json(messages.NOT_IMPLEMENTED)
      }

      const presentation = presentations.find(p => p.slang === body.presentation)

      const upload = await GeneratorAPI.uploadCover(body.user, body.userImage)

      const id = MiscUtils.generateRandomString(8, true)
      const serviceDescription = presentation.playlist.descriptionService
        .replace('{{url}}', `${process.env.PLAYLIST_URL}/${id}`)

      const newPlaylist = new Playlist({
        _id: id,
        name: presentation.playlist.name.replace('{{user}}', body.user),
        createdAt: new Date().getTime(),
        type: body.type,
        user: body.user,
        image: `https://share.musc.pw/${upload.name}`,
        presentation: body.presentation,
        description: presentation.playlist.description,
        serviceDescription,
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

    res.json(await DeezerAPI.getAuthenticatedProfile(token))
  })

  router.post('/deezer', async (req, res) => {
    try {
      const token = req.headers.authorization

      const { id } = await DeezerAPI.createPlaylist(token, req.body.name)

      const songs = req.body.items.filter(i => !!i.deezerId).map(i => i.deezerId)
      await DeezerAPI.addTracksToPLaylist(token, id, songs)

      res.json({
        id
      })
    } catch (e) {
      res.error(e)
    }
  })

  return router
}

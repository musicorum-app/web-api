const LFM = require('lastfm-node-client')
const chalk = require('chalk')
const fetch = require('node-fetch')
const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()
const { MiscUtils, crypto } = require('../utils')
const Sentry = require('@sentry/node')

const API_URL = 'https://api.spotify.com/v1'

Sentry.init({ dsn: process.env.SENTRY_DSN })

const fetchArtistsIDs = async artists => {
  return fetch(`${process.env.GENERATOR_URL}cache/artists`, {
    method: 'POST',
    headers: {
      authorization: process.env.ADMIN_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ artists })
  }).then(r => r.json())
}

module.exports = (musicorum) => {
  router.get('/artists', async (req, res) => {
    try {
      const { artists } = req.query
      const data = Buffer.from(artists, 'base64').toString()
      const list = await fetchArtistsIDs(JSON.parse(data))
      console.log(list)

      const spResult = await musicorum.spotify.request(`${API_URL}/artists?ids=${list.artists.join()}`)

      res.json(spResult.artists.map(a => ({
        name: a.name,
        images: a.images,
        uri: a.uri,
        id: a.id,
        popularity: a.popularity
      })))
    } catch (e) {
      console.error(e)
      res.status(500).json(messages.INTERNAL_ERROR)
    }
  })

  return router
}

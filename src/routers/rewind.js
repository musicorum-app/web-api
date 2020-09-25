const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()
const Sentry = require('@sentry/node')

Sentry.init({ dsn: process.env.SENTRY_DSN })

module.exports = (musicorum) => {
  router.post('/tracks', async (req, res) => {
    res.status(501).json(messages.NOT_IMPLEMENTED)
  })

  router.post('/artists', async (req, res) => {
    res.status(501).json(messages.NOT_IMPLEMENTED)
  })

  return router
}

const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()
const Sentry = require('@sentry/node')
const Preset = require('../db/schemas/Preset.js')
const { MiscUtils } = require('../utils')

Sentry.init({ dsn: process.env.SENTRY_DSN })

module.exports = (musicorum) => {
  router.post('/', async (req, res) => {
    try {
      if (!req.body.theme || !req.body.options || !req.body.slug) return res.status(400).json(messages.MISSING_PARAMETERS)

      const preset = new Preset({
        code: MiscUtils.generateRandomString(8),
        slug: req.body.slug,
        theme: req.body.theme,
        options: req.body.options
      })
      await preset.save()
      res.json({
        code: preset.code
      })
    } catch (e) {
      console.error(e)
      res.status(500).json(messages.INTERNAL_ERROR)
      Sentry.captureException(e)
    }
  })

  return router
}

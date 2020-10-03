const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()
const Sentry = require('@sentry/node')
const Preset = require('../db/schemas/Preset.js')
const PresetToken = require('../db/schemas/PresetToken.js')
const { MiscUtils } = require('../utils')

Sentry.init({ dsn: process.env.SENTRY_DSN })

module.exports = () => {
  router.post('/', async (req, res) => {
    try {
      if (!req.body.theme || !req.body.options || !req.body.token) return res.status(400).json(messages.MISSING_PARAMETERS)

      const presetToken = await PresetToken.findOne({
        token: req.body.token
      })

      if (!presetToken) {
        return res.status(404).json(messages.NOT_FOUND)
      }

      const preset = new Preset({
        slug: presetToken.slug,
        user: presetToken.user,
        theme: req.body.theme,
        options: req.body.options
      })
      await preset.save()
      await presetToken.delete()

      res.json({
        ok: true
      })
    } catch (e) {
      console.error(e)
      res.status(500).json(messages.INTERNAL_ERROR)
      Sentry.captureException(e)
    }
  })

  return router
}

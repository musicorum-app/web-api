const chalk = require('chalk')
const admin = require('../middleware/admin.js')
const Generation = require('../db/schemas/Generation.js')
const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()

module.exports = () => {
  router.post('/generation', admin, async (req, res) => {
    const { theme, timestamp, duration, status, source } = req.body
    if (!theme || !timestamp || !duration || !status || !source) {
      res.status(400).json(messages.MISSING_PARAMETERS)
      return
    }
    try {
      const newObj = new Generation({
        theme,
        timestamp,
        duration,
        status,
        source
      })

      newObj.save()

      res.json({ success: true })
    } catch (err) {
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  return router
}

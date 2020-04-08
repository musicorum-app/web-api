const LFM = require('lastfm-node-client')
const crypto = require('../utils/crypto.js')
const express = require('express')
const router = express.Router()

const LastFM = new LFM(process.env.LASTFM_KEY, process.env.LASTFM_SECRET)

module.exports = () => {
  router.get('/login', async (req, res) => {
    const { callback } = req.query
    const red = `${process.env.API_URL}mobile/callback?redirect=${callback}`
    res.redirect(`http://www.last.fm/api/auth/?api_key=${process.env.LASTFM_KEY}&cb=${encodeURIComponent(red)}`)
  })

  router.get('/callback', async (req, res) => {
    const { token, redirect } = req.query

    const { session } = await LastFM.authGetSession({ token })

    res.redirect(redirect + `?user=${session.name}&token=${crypto.encryptToken(session.key, process.env.LASTFM_MOBILE_CRYPTO)}`)
  })

  router.get('/auth/me', async (req, res) => {
    const token = req.header('Authorization')

    const fmToken = crypto.decryptToken(token, process.env.LASTFM_MOBILE_CRYPTO)
    const fmClient = new LFM(process.env.LASTFM_KEY, process.env.LASTFM_SECRET, fmToken)

    const user = await fmClient.userGetInfo()

    console.log(user)
    res.json({ ...user.user })
  })

  return router
}

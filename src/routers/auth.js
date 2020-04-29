const LoginWithTwitter = require('login-with-twitter')
const LFM = require('lastfm-node-client')
const chalk = require('chalk')
const Twit = require('twit')
const auth = require('../middleware/auth.js')
const User = require('../db/schemas/User.js')
const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()
const { MiscUtils, crypto } = require('../utils')
const Sentry = require('@sentry/node')

Sentry.init({ dsn: process.env.SENTRY_DSN })

const LastFM = new LFM(process.env.LASTFM_KEY, process.env.LASTFM_SECRET)

const TW = new LoginWithTwitter({
  consumerKey: process.env.TWITTER_API_KEY,
  consumerSecret: process.env.TWITTER_API_SECRET,
  callbackUrl: process.env.TWITTER_CALLBACK_URL
})

const twitterSecretTokens = new Map()

module.exports = () => {
  router.get('/me', auth, async (req, res) => {
    try {
      const { user } = req
      const { full } = req.query
      if (full) {
        const T = new Twit({
          consumer_key: process.env.TWITTER_API_KEY,
          consumer_secret: process.env.TWITTER_API_SECRET,
          access_token: crypto.decryptToken(user.twitter.accessToken, process.env.TWITTER_CRYPTO),
          access_token_secret: crypto.decryptToken(user.twitter.accessSecret, process.env.TWITTER_CRYPTO)
        })
        const { data } = await T.get('account/verify_credentials', { skip_status: true })
        const twitter = {
          id: data.id_str,
          name: data.name,
          user: data.screen_name,
          profilePicture: data.profile_image_url_https.replace('_normal', '')
        }
        let lastfm = null
        if (user.lastfm && user.lastfm.sessionKey) {
          const sk = crypto.decryptToken(user.lastfm.sessionKey, process.env.LASTFM_CRYPTO)
          const lfm = new LFM(process.env.LASTFM_KEY, process.env.LASTFM_SECRET, sk)
          const userInfo = await lfm.userGetInfo()
          const { image } = userInfo.user
          lastfm = {
            user: userInfo.user.name,
            name: userInfo.user.realname,
            profilePicture: image[image.length - 1]['#text']
          }
        }
        res.json({
          id: user._id,
          twitter,
          lastfm
        })
      } else {
        res.json({
          id: user._id
        })
      }
    } catch (err) {
      res.status(500).json(messages.INTERNAL_ERROR)
      Sentry.captureException(err)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.get('/twitter', async (req, res) => {
    TW.login((err, tokenSecret, url) => {
      if (err) {
        res.status(500).json(messages.INTERNAL_ERROR)
        console.error(chalk.bgRed(' ERROR ') + ' ' + err)
        console.error(err)
        return
      }

      const tokenId = MiscUtils.generateRandomString(16)
      twitterSecretTokens.set(tokenId, tokenSecret)

      res.json({
        url,
        tokenId
      })
    })
  })

  router.get('/lastfm', async (req, res) => {
    res.json({
      url: `http://www.last.fm/api/auth/?api_key=${process.env.LASTFM_KEY}&cb=${process.env.LASTFM_CALLBACK_URL}`
    })
  })

  router.post('/twitter/callback', async (req, res) => {
    try {
      const { oauthToken, oauthVerifier, tokenId } = req.body
      if (!oauthToken || !oauthVerifier || !tokenId) {
        res.status(400).json(messages.MISSING_PARAMETERS)
        return
      }
      const secret = twitterSecretTokens.get(tokenId)
      if (!secret) {
        res.status(400).json(messages.INVALID_TOKENID)
        return
      }
      TW.callback({
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier
      }, secret, async (err, user) => {
        if (err) {
          res.status(500).json(messages.INTERNAL_ERROR)
          console.error(chalk.bgRed(' ERROR ') + ' ' + err)
          console.error(err)
          return
        }

        const userDoc = await User.findOne({ 'twitter.id': user.userId })

        if (userDoc) {
          res.json({
            token: userDoc.generateAuthToken(),
            firstLogin: false
          })
        } else {
          const twitterAcc = new User.TwitterAccount({
            accessToken: crypto.encryptToken(user.userToken, process.env.TWITTER_CRYPTO),
            accessSecret: crypto.encryptToken(user.userTokenSecret, process.env.TWITTER_CRYPTO),
            id: user.userId
          })
          const newUser = new User({
            twitter: twitterAcc
          })
          newUser.save()
          res.json({
            token: newUser.generateAuthToken(),
            firstLogin: true
          })
        }

        twitterSecretTokens.delete(tokenId)
      })
    } catch (err) {
      Sentry.captureException(err)
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.post('/lastfm/callback', auth, async (req, res) => {
    try {
      const { token } = req.body
      if (!token) {
        res.status(400).json(messages.INVALID_TOKEN)
        return
      }
      const { session } = await LastFM.authGetSession({ token })
      console.log(session)

      res.json({ user: session.name })

      req.user.lastfm = new User.LastfmAccount({
        sessionKey: crypto.encryptToken(session.key, process.env.LASTFM_CRYPTO)
      })
      req.user.save()
    } catch (err) {
      Sentry.captureException(err)
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  return router
}

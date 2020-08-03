const chalk = require('chalk')
const morgan = require('morgan')
const cors = require('cors')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const authRouter = require('./routers/auth.js')
const schedulesRouter = require('./routers/schedules.js')
const controlsRouter = require('./routers/controls.js')
const mobileRouter = require('./routers/mobile.js')
const labsRouter = require('./routers/labs.js')
const playlistsRouter = require('./routers/playlist.js')
const rewindRoute = require('./routers/rewind')
const presetsRoute = require('./routers/presets.js')
const moment = require('moment')
const Sentry = require('@sentry/node')
const SpotifyApi = require('./apis/Spotify.js')

// const whitelist = process.env.CORS_WHITELIST.split(';')
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
Sentry.init({ dsn: process.env.SENTRY_DSN })

module.exports = class MusicorumAPI {
  init () {
    this.connectDatabase()
    this.initAPIS()
    this.port = process.env.PORT

    app.use(Sentry.Handlers.requestHandler())
    app.use(express.json())
    app.use(cors())
    app.use(morgan((t, q, s) => this.morganPattern(t, q, s)))
    // app.use(authMiddleware)
    app.use('/auth', authRouter(this))
    app.use('/schedules', schedulesRouter(this))
    app.use('/controls', controlsRouter(this))
    app.use('/mobile', mobileRouter(this))
    app.use('/labs', labsRouter(this))
    app.use('/playlists', playlistsRouter(this))
    app.use('/rewind', rewindRoute(this))
    app.use('/presets', presetsRoute(this))
    app.use((req, res) => res.json({
      error: 'NOT_FOUND',
      message: 'Not found.'
    }))
    app.use(Sentry.Handlers.errorHandler())

    app.listen(this.port, () =>
      console.log(chalk.bgGreen(' SUCCESS ') + ' Web server started on port ' + chalk.blue(this.port)))
  }

  morganPattern (tokens, req, res) {
    const colors = {
      GET: 'green',
      POST: 'blue',
      PUT: 'yellow',
      DELETE: 'red',
      PATCH: 'magenta'
    }
    const color = colors[req.method] || 'white'

    const time = chalk.cyan('[' + moment().format('DD/MM/YY HH:mm:ss Z') + ']')

    return time + chalk[color].bold(` ${tokens.status(req, res)} ${tokens.method(req, res)}`) + ` ${tokens.url(req, res)} - ${tokens['response-time'](req, res)} ms `
  }

  async connectDatabase () {
    console.log(chalk.yellow(' CONNECTING TO DATABASE... '))
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log(chalk.bgGreen(' SUCCESS ') + ' Database successfully connected.')
      })
      .catch(e => {
        console.log(chalk.bgRed(' DATABASE CONNECTION ERROR ') + e)
      })
    this.database = mongoose.connection
    this.database.on('error', console.error.bind(console, chalk.bgRed(' DATABASE CONNECTION ERROR ')))
  }

  async initAPIS () {
    this.spotify = new SpotifyApi({
      id: process.env.SPOTIFY_ID,
      secret: process.env.SPOTIFY_SECRET
    })
  }
}

const chalk = require('chalk')
const morgan = require('morgan')
const cors = require('cors')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const authRouter = require('./routers/auth.js')
const schedulesRouter = require('./routers/schedules.js')
const controlsRouter = require('./routers/controls.js')
const moment = require('moment')

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

module.exports = class MusicorumAPI {
  init () {
    this.connectDatabase()
    this.port = process.env.PORT

    app.use(express.json())
    app.use(cors())
    app.use(morgan((t, q, s) => this.morganPattern(t, q, s)))
    // app.use(authMiddleware)
    app.use('/auth', authRouter(this))
    app.use('/schedules', schedulesRouter(this))
    app.use('/controls', controlsRouter(this))
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
}

const chalk = require('chalk')
const morgan = require('morgan')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const authRouter = require('./routers/auth.js')

module.exports = class MusicorumAPI {
  init () {
    this.connectDatabase()
    this.port = process.env.PORT

    app.use(express.json())
    app.use(morgan((t, q, s) => this.morganPattern(t, q, s)))
    // app.use(authMiddleware)
    app.use('/auth', authRouter(this))
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

    return chalk[color].bold(` ${tokens.status(req, res)} ${tokens.method(req, res)}`) + ` ${tokens.url(req, res)} - ${tokens.res(req, res, 'content-lenght')} ms `
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

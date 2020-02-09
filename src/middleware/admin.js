const messages = require('../responses/messages.js')

module.exports = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json(messages.INVALID_TOKEN)
  }

  if (token === process.env.ADMIN_TOKEN) {
    next()
  } else {
    res.status(401).json(messages.INVALID_TOKEN)
  }
}

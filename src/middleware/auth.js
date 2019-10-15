const jwt = require('jsonwebtoken')
const User = require('../db/schemas/User.js')
const messages = require('../responses/messages.js')

module.exports = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json(messages.INVALID_TOKEN)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN)
    req.user = await User.findOne({ _id: decoded.id })
    next()
  } catch (ex) {
    res.status(401).json(messages.INVALID_TOKEN)
  }
}

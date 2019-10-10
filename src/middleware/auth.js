const jwt = require('jsonwebtoken')
const User = require('../db/schemas/User.js')

module.exports = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN)
    req.user = await User.findOne({ _id: decoded.id })
    next()
  } catch (ex) {
    res.status(400).json({ message: 'Invalid authentication token.' })
  }
}

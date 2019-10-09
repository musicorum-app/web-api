const crypto = require('crypto')

const IV_LENGTH = 16

module.exports = {
  encryptToken (token, key) {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
    let encrypted = cipher.update(token)

    encrypted = Buffer.concat([encrypted, cipher.final()])

    return iv.toString('hex') + '@' + encrypted.toString('hex')
  },

  decryptToken (encrypted, key) {
    const parts = encrypted.split('@')
    const iv = Buffer.from(parts.shift(), 'hex')
    const encryptedText = Buffer.from(parts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
    let decrypted = decipher.update(encryptedText)

    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
  }
}

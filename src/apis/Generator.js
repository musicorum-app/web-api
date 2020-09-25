const fetch = require('node-fetch')
const UploadAPI = require('./UploadAPI.js')
const { Readable } = require('stream')
const { MiscUtils } = require('../utils')

module.exports = class GeneratorAPI {
  static async uploadCover (user, image) {
    const buff = await fetch(`${process.env.GENERATOR_URL}covers/generate`, {
      method: 'POST',
      headers: {
        Authorization: process.env.ADMIN_TOKEN,
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        user,
        image,
        raw: true
      })
    }).then(r => r.buffer())
      .catch(e => console.error(e))


    const s = new Readable()
    s.push(buff)
    s.push(null)

    return UploadAPI.image4io(buff, '/p')
  }
}

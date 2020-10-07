const fetch = require('node-fetch')
const UploadAPI = require('./UploadAPI.js')

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

    return UploadAPI.cloudinary(buff, process.env.CLOUDINARY_PLAYLIST_PRESET)
  }
}

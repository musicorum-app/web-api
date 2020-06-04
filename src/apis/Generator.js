const fetch = require('node-fetch')
const UploadAPI = require('./UploadAPI.js')

module.exports = class GeneratorAPI {
  static async uploadCover (user, image) {
    const { base64 } = await fetch(`${process.env.GENERATOR_URL}covers/generate`, {
      method: 'POST',
      headers: {
        Authorization: process.env.ADMIN_TOKEN,
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ user, image })
    }).then(r => r.json())
      .catch(e => console.error(e))

    return UploadAPI(base64)
  }
}

const fetch = require('node-fetch')
const FormData = require('form-data')
const { generateRandomString } = require('../utils/misc.js')

module.exports = class UploadAPI {
  static async imagekitUpload (file) {
    const id = generateRandomString(16)
    const form = new FormData()
    form.append('fileName', `${id}.jpg`)
    form.append('useUniqueFileName', 'false')
    form.append('file', file)

    return fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.PRIVATE_KEY_ENCODED}`
      },
      body: form
    }).then(r => r.json())
  }

  static async image4io (file, path = '/') {
    const id = generateRandomString(32)
    const form = new FormData()
    form.append('path', path)
    form.append('useFilename', 'true')
    form.append('file', file, {
      filename: id + '.jpg'
    })

    const res = await fetch('https://api.image4.io/v1.0/uploadImage', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${process.env.IMAGE4IO_AUTH}`,
        ...(form.getHeaders())
      },
      body: form
    })

    // console.log(await res.json())

    return res.json()
  }

  static async cloudinary (file, preset) {
    const id = generateRandomString(32)
    const form = new FormData()
    form.append('upload_preset', preset)
    form.append('file', file, {
      filename: id + '.jpg'
    })

    const res = await fetch(process.env.CLOUDINARY_URL, {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    })

    return res.json()
  }
}

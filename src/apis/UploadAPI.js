const fetch = require('node-fetch')
const FormData = require('form-data')
const { generateRandomString } = require('../utils/misc.js')

module.exports = async file => {
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

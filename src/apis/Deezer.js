const fetch = require('node-fetch')
const API_URL = 'https://api.deezer.com/'

module.exports = class DeezerAPI {
  static async request (path, args) {
    return fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(r => r.json())
  }

  static searchArtist (name) {
    return DeezerAPI.request(`search/artist?q=${encodeURIComponent(name)}`)
  }
}

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

  static searchTrack (name, artist) {
    console.log(name)
    return DeezerAPI.request(`search/track?q=artist:"${encodeURIComponent(artist)}" track:"${encodeURIComponent(name)}"`)
  }
}

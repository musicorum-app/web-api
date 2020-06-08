const fetch = require('node-fetch')
const FormData = require('form-data')
const API_URL = 'https://api.deezer.com/'

module.exports = class DeezerAPI {
  static async request (path) {
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
    return DeezerAPI.request(`search/track?q=artist:"${encodeURIComponent(artist)}" track:"${encodeURIComponent(name)}"`)
  }

  static getAuthenticatedProfile (accessToken) {
    return DeezerAPI.request(`user/me?access_token=${accessToken}`)
  }

  static createPlaylist (accessToken, name) {
    const params = new URLSearchParams({
      access_token: accessToken,
      request_method: 'POST',
      title: name
    })
    return DeezerAPI.request('user/me/playlists?' + params)
  }

  static addTracksToPLaylist (accessToken, playlist, tracks) {
    const params = new URLSearchParams({
      access_token: accessToken,
      request_method: 'POST',
      songs: tracks.join(',')
    })
    return DeezerAPI.request(`playlist/${playlist}/tracks?${params}`)
  }
}

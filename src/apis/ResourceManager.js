const fetch = require('node-fetch')

module.exports = class ResourceManagerAPI {
  static async request (path, body) {
    return fetch(`${process.env.RESOURCE_MANAGER_URL}${path}`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(r => r.json())
  }

  static async fetchArtists (artists) {
    return ResourceManagerAPI.request('/resource/artists', { artists })
  }

  static async fetchAlbums (albums) {
    return ResourceManagerAPI.request('/resource/albums', { albums })
  }

  static async fetchTracks (tracks, deezer = false) {
    let query = '?'
    if (deezer) query += 'deezer=true'
    return ResourceManagerAPI.request('/resource/tracks' + query, { tracks })
  }
}

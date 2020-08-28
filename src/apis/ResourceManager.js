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
    return ResourceManagerAPI.request('/fetch/artists', { artists })
  }

  static async fetchAlbums (albums) {
    return ResourceManagerAPI.request('/fetch/albums', { albums })
  }

  static async fetchTracks (tracks) {
    return ResourceManagerAPI.request('/fetch/tracks', { tracks })
  }
}

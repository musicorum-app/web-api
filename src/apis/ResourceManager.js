const fetch = require('node-fetch')

module.exports = class ResourceManagerAPI {
  static async request (path, body, method = 'post') {
    return fetch(`${process.env.RESOURCE_MANAGER_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : null
    }).then(r => r.json())
  }

  static async findArtists (artists) {
    return ResourceManagerAPI.request('/find/artists', { artists })
  }

  static async findAlbums (albums) {
    return ResourceManagerAPI.request('/find/albums', { albums })
  }

  static async findTracks (tracks, deezer = false) {
    let query = '?'
    if (deezer) query += 'deezer=true'
    return ResourceManagerAPI.request('/find/tracks' + query, { tracks })
  }

  static async fetchTracks (tracks) {
    return ResourceManagerAPI.request('/tracks?tracks=' + tracks.join(','), null, 'get')
  }
}

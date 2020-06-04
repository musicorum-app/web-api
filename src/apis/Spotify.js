const Spotify = require('node-spotify-api')

const API_URL = 'https://api.spotify.com/v1'

module.exports = class SpotifyApi extends Spotify {
  async getArtists (ids) {
    return this.request(`${API_URL}/artists?ids=${ids.join()}`)
  }

  async getTracks (ids) {
    return this.request(`${API_URL}/tracks?ids=${ids.join()}`)
  }
}

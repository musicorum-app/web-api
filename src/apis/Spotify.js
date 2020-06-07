const Spotify = require('node-spotify-api')
const fetch = require('node-fetch')
const queryString = require('querystring')

const API_URL = 'https://api.spotify.com/v1'

module.exports = class SpotifyApi extends Spotify {
  async getArtists (ids) {
    return this.request(`${API_URL}/artists?ids=${ids.join()}`)
  }

  async getTracks (ids) {
    return this.request(`${API_URL}/tracks?ids=${ids.join()}`)
  }

  async getTokenFromCode (code) {
    const form = queryString.encode({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.SPOTIFY_CALLBACK_URL,
      client_id: process.env.SPOTIFY_ID,
      client_secret: process.env.SPOTIFY_SECRET
    })
    console.log(form)

    return fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: form
    }).then(r => r.json())
  }

  async getUserFromToken (token) {
    return fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(r => r.json())
  }
}

const fetch = require('node-fetch')
const API_URL = 'https://www.googleapis.com/youtube/v3/'

module.exports = class YoutubeAPI {
  static async request (path, qs) {
    const qr = new URLSearchParams({
      key: process.env.YOUTUBE_API,
      ...qs
    })
    // console.log(`${API_URL}${path}?${qr}`)
    return fetch(`${API_URL}${path}?${qr}`).then(r => r.json())
  }

  static searchArtist (name) {
    return YoutubeAPI.request('search', {
      part: 'id',
      type: 'channel',
      q: encodeURIComponent(name)
    })
  }
}

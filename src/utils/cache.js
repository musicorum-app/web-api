const fetch = require('node-fetch')
const DeezerAPI = require('../apis/Deezer.js')
const YoutubeAPI = require('../apis/Youtube.js')
const MiscUtils = require('./misc.js')

module.exports = class CacheBridge {
  static async request (path, body) {
    return fetch(`${process.env.GENERATOR_URL}${path}`, {
      method: 'POST',
      headers: {
        authorization: process.env.ADMIN_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(r => r.json())
  }

  static async fetchArtistsIDs (artists) {
    return CacheBridge.request('cache/artists', { artists })
  }

  static async chunkRequests (mapper, list, itemMapper) {
    const reqs = []

    list.slice(0, 50).forEach(r => reqs.push(async () => (mapper(r))))

    const result = []

    const chunks = MiscUtils.chunkArray(reqs, 2)
    for (const chunk of chunks) {
      const res = await Promise.all(chunk.map(f => f()))
      await MiscUtils.wait(900)
      res.forEach(r => result.push(itemMapper(r)))
    }

    return result
  }

  static async getArtistsFromDeezer (list) {
    const mapper = async a => (new Promise(resolve => resolve(DeezerAPI.searchArtist(a))))
    const itemMapper = r => r.data.length ? r.data[0] : null
    return CacheBridge.chunkRequests(mapper, list, itemMapper)
  }

  static async getArtistsFromYoutube (list) {
    const mapper = async a => (new Promise(resolve => resolve(YoutubeAPI.searchArtist(a))))
    const itemMapper = r => r.items.length ? r.items[0] : null
    return CacheBridge.chunkRequests(mapper, list, itemMapper)
  }
}

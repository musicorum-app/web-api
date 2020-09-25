const cdns = require('../assets/cdns.json')
const presentations = require('../assets/presentations.json')

module.exports = class FormatterUtil {
  static formatPlaylist (playlist) {
    const newPlaylist = { ...playlist }
    delete newPlaylist._id
    delete newPlaylist.__v
    delete newPlaylist.items
    newPlaylist.items = playlist.items.map(i => {
      const ni = { ...i._doc }
      delete ni._id
      return ni
    })

    const cdn = cdns[playlist.image.cdn]
    newPlaylist.image = cdn + playlist.image.path

    const presentation = presentations.find(p => p.slang === playlist.presentation)

    return {
      id: playlist._id,
      name: this.repalcePlaylist(presentation.playlist.name, playlist),
      description: this.repalcePlaylist(presentation.playlist.description, playlist),
      service_description: this.repalcePlaylist(presentation.playlist.descriptionService, playlist),
      image: cdn + playlist.image.path,
      ...newPlaylist
    }
  }

  static repalcePlaylist (str, playlist) {
    return str
      .replace('{{url}}', `${process.env.PLAYLIST_URL}/${playlist._id}`)
      .replace('{{user}}', playlist.user)
  }
}

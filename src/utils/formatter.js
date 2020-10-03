const cdns = require('../assets/cdns.json')
const presentations = require('../assets/presentations.json')

module.exports = class FormatterUtil {
  static formatPlaylist (playlist) {
    const newPlaylist = { ...playlist }
    delete newPlaylist._id
    delete newPlaylist.__v
    // delete newPlaylist.items
    // newPlaylist.items = playlist.items.map(i => {
    //   const ni = { ...i._doc }
    //   delete ni._id
    //   return ni
    // })

    const cdn = cdns[playlist.image.cdn]
    newPlaylist.image = cdn + playlist.image.path

    const presentation = presentations.find(p => p.id === playlist.presentation)

    newPlaylist.presentation = {
      id: presentation.id,
      assets: presentation.assets
    }

    return {
      id: playlist._id,
      name: this.replacePlaylist(presentation.playlist.name, playlist),
      description: this.replacePlaylist(presentation.playlist.description, playlist),
      service_description: this.replacePlaylist(presentation.playlist.description_service, playlist),
      image: cdn + playlist.image.path,
      ...newPlaylist,
      items: newPlaylist.items
    }
  }

  static replacePlaylist (str, playlist) {
    return str
      .replace('{{url}}', `${process.env.PLAYLIST_URL}/${playlist._id}`)
      .replace('{{user}}', playlist.user)
  }
}

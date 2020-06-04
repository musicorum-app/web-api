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
    return {
      id: playlist._id,
      ...newPlaylist
    }
  }
}

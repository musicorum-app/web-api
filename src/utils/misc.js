module.exports = {
  generateRandomString (length) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  },

  renameKeyInObject (obj, key, name) {
    if (key === name) {
      return obj
    }
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      obj[name] = obj[key]
      delete obj[key]
    }
    return obj
  }
}

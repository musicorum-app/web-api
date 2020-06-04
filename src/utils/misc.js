module.exports = {
  generateRandomString (length, extra = false) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' +
      (extra ? '_-' : '')

    let result = ''
    for (var i = 0; i < length; i++) result += characters.charAt(Math.floor(Math.random() * characters.length))

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
  },

  chunkArray (array, pieces) {
    return Array(Math.ceil(array.length / pieces)).fill().map((_, i) => array.slice(i * pieces, i * pieces + pieces))
  },

  wait (ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }
}

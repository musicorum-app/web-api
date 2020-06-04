const Joi = require('@hapi/joi')
const presentations = require('../assets/presentations.json')

module.exports = Joi.object({
  type: Joi.string()
    .valid('TOP_ARTIST', 'TOP_TRACK', 'TOP_ALBUM', 'LOVED_TRACK')
    .required(),

  presentation: Joi.string()
    .valid(...presentations.map(p => p.slang))
    .required(),

  user: Joi.string()
    .min(1)
    .max(90)
    .required(),

  userImage: Joi.string()
    .min(10)
    .max(400)
    .required(),

  items: Joi.array()
    .items(Joi.object({
      name: Joi.string()
        .min(1)
        .max(400)
        .required(),

      url: Joi.string()
        .min(1)
        .max(460)
        .required(),

      artist: Joi.string()
        .min(1)
        .max(400)
    }))
    .min(1)
    .max(50)
    .required()
})

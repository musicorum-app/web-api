const Joi = require('@hapi/joi')
const presentations = require('../assets/presentations.json')

module.exports = Joi.object({
  type: Joi.string()
    .valid('TOP_ARTISTS', 'TOP_TRACKS', 'TOP_ALBUMS', 'LOVED_TRACKS')
    .required(),

  presentation: Joi.string()
    .valid(...presentations.map(p => p.id))
    .required(),

  user: Joi.string()
    .min(1)
    .max(90)
    .required(),

  user_image: Joi.string()
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
    .max(100)
    .required()
})

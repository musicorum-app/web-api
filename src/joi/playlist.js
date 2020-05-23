const Joi = require('@hapi/joi')

module.exports = Joi.object({
  type: Joi.string()
    .valid('TOP_ARTIST', 'TOP_TRACK', 'TOP_ALBUM', 'LOVED_TRACKS')
    .required(),

  presentation: Joi.string()
    .valid('2020_REWIND')
    .required(),

  user: Joi.string()
    .min(1)
    .max(90)
    .required(),

  items: Joi.array()
    .items(Joi.object({
      name: Joi.string()
        .min(1)
        .max(400)
        .required(),

      artist: Joi.string()
        .min(1)
        .max(400)
    }))
    .min(1)
    .max(50)
    .required()
})

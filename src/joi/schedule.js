const Joi = require('@hapi/joi')
const timezones = require('../utils/timezones.json')

module.exports = Joi.object({
  name: Joi.string()
    .min(1)
    .max(15)
    .required(),

  schedule: Joi.string()
    .valid('MONTHY', 'WEEKLY')
    .required(),

  time: Joi.number()
    .min(0)
    .max(1440)
    .required(),

  timezone: Joi.string()
    .valid(...Object.keys(timezones))
    .required(),

  theme: Joi.string()
    .valid('grid', 'tops')
    .required(),

  themeOptions: {
    period: Joi.string()
      .valid('overall', '7day', '1month', '3month', '6month', '12month'),

    top: Joi.string()
      .max(15),

    size: Joi.number(),

    names: Joi.boolean(),

    playcount: Joi.boolean(),

    modules: Joi.array(),

    messages: Joi.object()
  }
})

module.exports.notRequired = Joi.object({
  name: Joi.string()
    .min(1)
    .max(15),

  schedule: Joi.string()
    .valid('MONTHY', 'WEEKLY'),

  time: Joi.number()
    .min(0)
    .max(1440),

  timezone: Joi.string()
    .valid(...Object.keys(timezones)),

  theme: Joi.string()
    .valid('grid', 'tops'),

  themeOptions: {
    period: Joi.string()
      .valid('overall', '7day', '1month', '3month', '6month', '12month'),

    top: Joi.string()
      .max(15),

    size: Joi.number(),

    names: Joi.boolean(),

    playcount: Joi.boolean(),

    modules: Joi.array(),

    messages: Joi.object()
  }
})

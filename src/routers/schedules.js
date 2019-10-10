const chalk = require('chalk')
const Joi = require('@hapi/joi')
const auth = require('../middleware/auth.js')
const MiscUtils = require('../utils/misc.js')
const User = require('../db/schemas/User.js')
const ScheduleJoi = require('../joi/schedule.js')
const express = require('express')
const router = express.Router()

module.exports = (musicorum) => {
  router.get('/', auth, async (req, res) => {
    try {
      const { schedules } = req.user
      if (!schedules) {
        res.json({ schedules: [] })
        return
      }
      const list = schedules.map(sch => {
        const s = Object.assign({ id: sch._doc._id }, sch._doc)
        delete s._id
        return s
      })
      res.json(list)
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message })
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.put('/', auth, async (req, res) => {
    try {
      const { schedules } = req.user

      if (schedules && schedules.length > 2) {
        res
          .status(400)
          .json({ message: 'Limit reached' })
        return
      }

      const schedule = req.body

      ScheduleJoi.validateAsync(schedule)
        .then(a => {
          const sch = new User.Schedule(a)
          User.update(
            { _id: req.user._id },
            { $push: { schedules: sch } },
            (err, raw) => {
              if (err) {
                throw new Error('Could not create item on database.')
              } else {
                res.json({
                  success: true
                })
              }
            }
          )
        })
        .catch(err => {
          res
            .status(400)
            .json({ message: err.message })
        })
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message })
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.delete('/:id', auth, async (req, res) => {
    try {
      const id = req.params.id
      const { schedules } = req.user
      if (!id) {
        res
          .status(404)
          .json({ message: 'Invalid id.' })
        return
      }
      const scheIds = schedules.map(s => s._id)

      if (!scheIds.includes(id)) {
        res
          .status(404)
          .json({ message: 'Schedule not found.' })
        return
      }

      schedules.pull({ _id: id })
      req.user.save()

      res.json({ success: true })
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message })
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.patch('/:id', auth, async (req, res) => {
    // TODO: FIX THAT SHIT
    try {
      const id = req.params.id
      const { schedules } = req.user

      if (!id) {
        res
          .status(404)
          .json({ message: 'Invalid id.' })
        return
      }
      const scheIds = schedules.map(s => s._id)

      if (!scheIds.includes(id)) {
        res
          .status(404)
          .json({ message: 'Schedule not found.' })
        return
      }

      console.log(typeof schedules.map(s => s._id)[0])
      
      const schedule = schedules.find(s => s._id === id)
      const patch = req.body
      
      console.log(schedule)
      console.log(patch)

      if (!patch) {
        res
          .status(400)
          .json({ message: 'No patch.' })
        return
      }
      if (!(patch instanceof Object)) {
        res
          .status(400)
          .json({ message: 'Invalid patch.' })
        return
      }

      if (Object.keys(patch).length === 0) {
        res
          .status(400)
          .json({ message: 'Invalid patch.' })
        return
      }

      ScheduleJoi.notRequired.validateAsync(patch)
        .then(a => {
          const newSchedule = Object.assign(schedule, patch)
          req.user.save()
          res.json({ success: true, schedule: newSchedule })
        })
        .catch(err => {
          res
            .status(400)
            .json({ message: err.message })
        })
    } catch (err) {
      res
        .status(500)
        .json({ message: err.message })
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  return router
}

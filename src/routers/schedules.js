const chalk = require('chalk')
const auth = require('../middleware/auth.js')
const User = require('../db/schemas/User.js')
const ScheduleJoi = require('../joi/schedule.js')
const messages = require('../responses/messages.js')
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
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.put('/', auth, async (req, res) => {
    try {
      const { schedules } = req.user

      if (schedules && schedules.length > 2) {
        res.status(400).json(messages.SCHEDULES_LIMIT_REACHED)
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
        .catch(() => res.status(400).json(messages.INTERNAL_ERROR))
    } catch (err) {
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.delete('/:id', auth, async (req, res) => {
    try {
      const id = req.params.id
      const { schedules } = req.user
      if (!id) {
        res.status(404).json(messages.SCHEDULE_NOT_FOUND)
        return
      }
      const scheIds = schedules.map(s => s._id)

      if (!scheIds.includes(id)) {
        res.status(404).json(messages.SCHEDULE_NOT_FOUND)
        return
      }

      schedules.pull({ _id: id })
      req.user.save()

      res.json({ success: true })
    } catch (err) {
      res.status(500).json(messages.INTERNAL_ERROR)
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
        res.status(404).json(messages.SCHEDULE_NOT_FOUND)
        return
      }
      const scheIds = schedules.map(s => s._id)

      if (!scheIds.includes(id)) {
        res.status(404).json(messages.SCHEDULE_NOT_FOUND)
        return
      }

      console.log(typeof schedules.map(s => s._id)[0])

      const schedule = schedules.find(s => s._id === id)
      const patch = req.body

      console.log(schedule)
      console.log(patch)

      if (!patch) {
        res.status(404).json(messages.INVALID_PATCH)
        return
      }
      if (!(patch instanceof Object)) {
        res.status(404).json(messages.INVALID_PATCH)
        return
      }

      if (Object.keys(patch).length === 0) {
        res.status(404).json(messages.INVALID_PATCH)
        return
      }

      ScheduleJoi.notRequired.validateAsync(patch)
        .then(a => {
          const newSchedule = Object.assign(schedule, patch)
          req.user.save()
          res.json({ success: true, schedule: newSchedule })
        })
        .catch(() => res.status(500).json(messages.INTERNAL_ERROR))
    } catch (err) {
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.get('/:id/runs', auth, async (req, res) => {
    // TODO
  })

  return router
}

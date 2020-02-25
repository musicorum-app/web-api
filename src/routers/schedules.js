const chalk = require('chalk')
const { SchedulerAPI } = require('../utils/index.js')
const auth = require('../middleware/auth.js')
const User = require('../db/schemas/User.js')
const Run = require('../db/schemas/Run.js')
const ScheduleJoi = require('../joi/schedule.js')
const messages = require('../responses/messages.js')
const express = require('express')
const router = express.Router()

module.exports = () => {
  router.get('/', auth, async (req, res) => {
    try {
      const { schedules } = req.user
      if (!schedules) {
        res.json({ schedules: [] })
        return
      }
      const list = schedules.map(async sch => {
        const s = Object.assign({ id: sch._doc._id }, sch._doc)
        const runsArr = await Run.find({ schedule: s._id })
        delete s._id
        return {
          ...s,
          runs: runsArr.length
        }
      })
      console.log(list)
      res.json(await Promise.all(list))
    } catch (err) {
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.post('/', auth, async (req, res) => {
    try {
      const { schedules, lastfm } = req.user

      if (schedules && schedules.length > 2) {
        res.status(400).json(messages.SCHEDULES_LIMIT_REACHED)
        return
      }

      if (!lastfm) {
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
            async (err) => {
              if (err) {
                res.status(400).json(messages.INTERNAL_ERROR)
              } else {
                res.json({
                  success: true
                })
                console.log(await SchedulerAPI.startSchedule(req.user._id, sch._id))
              }
            }
          )
        })
        .catch(e => {
          console.error(e)
          res.status(400).json({
            error: {
              code: 'A#400#000',
              message: e.details[0].message,
              error: 'ERROR_VALIDATING'
            }
          })
        })
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
      await req.user.save()

      await res.json({ success: true })
      console.log(await SchedulerAPI.stopSchedule(id))
    } catch (err) {
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.patch('/:id', auth, async (req, res) => {
    res.status(500).json(['WIP'])
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

      const schedule = schedules.find(s => s._id.toString() === id)
      const patch = req.body

      if (patch._id) {
        delete patch._id
      }

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
        .then(() => {
          const newSchedule = {
            schedule,
            ...patch
          }
          req.user.save()
          res.json({ success: true, schedule: newSchedule })
        })
        .catch(err => {
          res.status(500).json(messages.INTERNAL_ERROR)
          console.error(chalk.bgRed(' ERROR ') + ' ' + err)
          console.error(err)
        })
    } catch (err) {
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  router.get('/:id/runs', auth, async (req, res) => {
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

      let runs = await Run.find({ schedule: id })

      runs = runs.map(run => {
        const s = Object.assign({ id: run._doc._id }, run._doc)
        delete s._id
        delete s.__v
        delete s.schedule
        return s
      })

      res.json({ runs })
    } catch (err) {
      res.status(500).json(messages.INTERNAL_ERROR)
      console.error(chalk.bgRed(' ERROR ') + ' ' + err)
      console.error(err)
    }
  })

  return router
}

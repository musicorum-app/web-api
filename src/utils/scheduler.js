const fetch = require('node-fetch')

const API_URL = process.env.SCHEDULER_URL
const TOKEN = process.env.SCHEDULER_TOKEN

module.exports = class SchedulerAPI {
  static async startSchedule (user, schedule) {
    return fetch(API_URL + `tasks/${user}/${schedule}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN
      }
    }).then(r => r.json())
  }

  static async stopSchedule (schedule) {
    return fetch(API_URL + `tasks/${schedule}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: TOKEN
      }
    }).then(r => r.json())
  }
}

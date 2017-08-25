'use strict'

// NPM modules
const request = require('request-promise-native')

// Library modules
const log = require('level-logger')('bot-connector-facebook:user-data')

module.exports = (user) => {
  if (!user) return Promise.reject(new Error('no user given'))
  return request({
    uri: `${process.env.FB_API_URL}/${user.id}`,
    method: 'GET',
    qs: {
      access_token: process.env.FB_PAGE_ACCESS_TOKEN
    }
  })
  .then(data => {
    try {
      return JSON.parse(data)
    } catch (error) {
      return Promise.reject(error)
    }
  })
  .catch(error => {
    log.error('failed getting user data:', error)
    return {}
  })
}

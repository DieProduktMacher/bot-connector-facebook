'use strict'

// Library modules
const log = require('level-logger')('bot-connector-facebook:connector')

// Functions
const main = (event, handler, normalizer, callback) => {
  let rawFBData = {}
  // just to be save
  try { rawFBData = JSON.parse(event.body) } catch (error) { log.error('failed parsing event body', error) }
  // check if the event was concering a facebook page subscription
  if (rawFBData.object !== 'page') return callback(null, {statusCode: 400, data: `Cannot handle subscriptions other than 'page': ${rawFBData.object}`})
  // immediately report back to facebook
  callback(null, {statusCode: 204})
  // iterate over entry
  rawFBData.entry.forEach(entry => {
    // iterate over the raw messaging events
    entry.messaging.forEach(input => {
      // pass normalized messaging events to the userInputHandler
      handler(normalizer(input))
    })
  })
}

const verify = (event, callback) => {
  const query = event.queryStringParameters
  // check for existing challenge and verify token is matching
  if (query['hub.challenge'] && query['hub.verify_token'] === process.env.FB_MESSENGER_VERIFICATION_TOKEN) {
    return callback(null, {
      statusCode: 200,
      body: query['hub.challenge']
    })
  }
  // reject
  callback(null, {
    statusCode: 401,
    body: 'Failed verification. Make sure the verify_token matches and a challenge is given.'
  })
}

module.exports = {
  main,
  verify
}

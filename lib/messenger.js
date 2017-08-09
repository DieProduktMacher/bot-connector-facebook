'use strict'

// NPM modules
const request = require('request-promise-native')

// Library modules
const log = require('level-logger')('bot-connector-facebook:messenger')

const build = {
  typing: (recipient, switchOnOff) => ({recipient, sender_action: `typing_${switchOnOff}`}),
  message: (recipient, message) => ({recipient, message}),
  messages: (recipient, messages) => messages.map(message => build.message(recipient, message)),
  text: (recipient, text) => build.message(recipient, {text}),
  texts: (recipient, texts) => texts.map(text => build.text(recipient, text))
}

const send = {
  one: (json) => {
    log.debug('sending:', json)
    return request({
      uri: `${process.env.FB_API_URL}/me/messages`,
      method: 'POST',
      qs: {
        access_token: process.env.FB_PAGE_ACCESS_TOKEN
      },
      json
    })
    .catch(error => {
      log.error('failed sending:', error)
      return Promise.reject(error)
    })
  },
  all: (items) => {
    const item = items.shift()
    if (item) return send.one(item).then(_ => send.all(items))
    return Promise.resolve()
  }
}

const response = {
  typingOn: (recipient) => send.one(build.typing(recipient, 'on')),
  typingOff: (recipient) => send.one(build.typing(recipient, 'off')),
  message: (recipient, message) => send.one(build.message(recipient, message)),
  messages: (recipient, messages) => send.all(build.messages(recipient, messages)),
  text: (recipient, text) => send.one(build.text(recipient, text)),
  texts: (recipient, texts) => send.all(build.texts(recipient, texts))
}

module.exports = {
  build,
  send,
  response
}

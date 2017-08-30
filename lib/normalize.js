'use strict'

module.exports = (input) => {
  const message = input.message || {}
  const normalized = {
    sender: input.sender,
    text: message.text,
    payload: {
      raw: (input.postback || message.quick_reply || {}).payload,
      data: {}
    },
    attachments: message.attachments || []
  }

  normalized.attachments.forEach(attachment => {
    if (attachment.type === 'location') normalized.location = attachment.payload.coordinates
  })

  if (typeof normalized.payload.raw === 'string') {
    try {
      normalized.payload.data = JSON.parse(normalized.payload.raw)
    } catch (_) {
      normalized.payload.data = {text: normalized.payload.raw}
    }
  }

  return normalized
}

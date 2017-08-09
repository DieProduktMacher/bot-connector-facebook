'use strict'

module.exports = (input) => {
  const normalized = {
    sender: input.sender,
    text: (input.message || {}).text,
    payload: {
      raw: (input.postback || (input.message || {}).quick_reply || {}).payload,
      data: {}
    }
  }

  if (typeof normalized.payload.raw === 'string') {
    try {
      normalized.payload.data = JSON.parse(normalized.payload.raw)
    } catch (_) {
      normalized.payload.data = {text: normalized.payload.raw}
    }
  }
  return normalized
}

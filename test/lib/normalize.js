'use strict'

const normalize = libRequire('normalize')

describe('normalize', function () {
  it('returns a new object', function () {
    const data = {}
    expect(normalize(data)).to.not.equal(data)
  })

  it('contains the sender', function () {
    const data = {sender: {id: 1234}}
    expect(normalize(data).sender).equal(data.sender)
  })

  it('contains text from message', function () {
    const data = {message: {text: 'foo'}}
    expect(normalize(data).text).equal(data.message.text)
  })

  it('contains payload from postback', function () {
    const data = {postback: {payload: 'foo'}}
    expect(normalize(data).payload.raw).equal(data.postback.payload)
    expect(normalize(data).payload.data.text).equal(data.postback.payload)
  })

  it('contains payload from message quick_reply', function () {
    const data = {message: {quick_reply: {payload: 'foo'}}}
    expect(normalize(data).payload.raw).equal(data.message.quick_reply.payload)
    expect(normalize(data).payload.data.text).equal(data.message.quick_reply.payload)
  })

  it('contains payload data from JSON in postback', function () {
    const data = {postback: {payload: '{"foo": "foo"}'}}
    expect(normalize(data).payload.raw).equal(data.postback.payload)
    expect(normalize(data).payload.data).eql(JSON.parse(data.postback.payload))
  })

  it('contains payload data from JSON in message quick_reply', function () {
    const data = {message: {quick_reply: {payload: '{"foo": "foo"}'}}}
    expect(normalize(data).payload.raw).equal(data.message.quick_reply.payload)
    expect(normalize(data).payload.data).eql(JSON.parse(data.message.quick_reply.payload))
  })
})

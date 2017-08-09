'use strict'

const input = libRequire('input')

describe('fb/input.normalizer(data)', function () {
  it('returns a new object', function () {
    const data = {}
    expect(input.normalizer(data)).to.not.equal(data)
  })

  it('contains the sender', function () {
    const data = {sender: {id: 1234}}
    expect(input.normalizer(data).sender).equal(data.sender)
  })

  it('contains text from message', function () {
    const data = {message: {text: 'foo'}}
    expect(input.normalizer(data).text).equal(data.message.text)
  })

  it('contains payload from postback', function () {
    const data = {postback: {payload: 'foo'}}
    expect(input.normalizer(data).payload.raw).equal(data.postback.payload)
    expect(input.normalizer(data).payload.data.text).equal(data.postback.payload)
  })

  it('contains payload from message quick_reply', function () {
    const data = {message: {quick_reply: {payload: 'foo'}}}
    expect(input.normalizer(data).payload.raw).equal(data.message.quick_reply.payload)
    expect(input.normalizer(data).payload.data.text).equal(data.message.quick_reply.payload)
  })

  it('contains payload data from JSON in postback', function () {
    const data = {postback: {payload: '{"foo": "foo"}'}}
    expect(input.normalizer(data).payload.raw).equal(data.postback.payload)
    expect(input.normalizer(data).payload.data).eql(JSON.parse(data.postback.payload))
  })

  it('contains payload data from JSON in message quick_reply', function () {
    const data = {message: {quick_reply: {payload: '{"foo": "foo"}'}}}
    expect(input.normalizer(data).payload.raw).equal(data.message.quick_reply.payload)
    expect(input.normalizer(data).payload.data).eql(JSON.parse(data.message.quick_reply.payload))
  })
})

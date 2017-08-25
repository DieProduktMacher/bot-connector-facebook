'use strict'

describe('user-data', function () {
  let userData
  let request

  process.env.FB_API_URL = 'fb_api_url'
  process.env.FB_PAGE_ACCESS_TOKEN = 'FB_PAGE_ACCESS_TOKEN'

  beforeEach(function () {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })

    request = sinon.stub()
    mockery.registerMock('request-promise-native', request)

    userData = libRequire('user-data')
  })

  afterEach(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  describe('normal operation', function () {
    const user = {id: 123456}
    const expectedRequestData = {
      uri: `${process.env.FB_API_URL}/${user.id}`,
      method: 'GET',
      qs: {access_token: process.env.FB_PAGE_ACCESS_TOKEN}
    }

    it('fetches the userData from facebook', function () {
      request.callsFake(_ => Promise.resolve('response'))
      return userData(user)
        .then(_ => {
          assert(request.calledOnce)
          expect(request).to.have.been.calledWith(expectedRequestData)
        })
    })

    it('JSON.parse()-es the response', function () {
      const response = 'response'
      request.callsFake(_ => Promise.resolve(response))
      const jsonParse = sinon.stub(JSON, 'parse')
      return userData(user)
        .then(data => {
          expect(jsonParse).to.have.been.calledWith(response)
          JSON.parse.restore()
        })
    })

    it('resolves the promise with JSON.parse()-ed', function () {
      const expectedData = {response: 'response'}
      const response = JSON.stringify(expectedData)
      request.callsFake(_ => Promise.resolve(response))
      return userData(user)
        .then(data => {
          expect(data).to.eql(expectedData)
        })
    })

    it('does not throw on not JSON.parse()-able the responses', function () {
      const response = 'not a valid JSON'
      request.callsFake(_ => Promise.resolve(response))
      expect(() => userData(user)).to.not.throw()
    })

    it('user id is not set', function () {
      const response = 'response'
      request.callsFake(_ => Promise.resolve(response))
      expect(() => userData(user)).to.not.throw()
    })
  })
})

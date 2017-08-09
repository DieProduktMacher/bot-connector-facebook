'use strict'

const lambda = libRequire('lambda')

describe('lambda', function () {
  describe('main', function () {
    const event = {
      body: JSON.stringify({
        object: 'page',
        entry: [
          {
            messaging: [
              {text: 'one'},
              {text: 'two'}
            ]
          },
          {
            messaging: [
              {text: 'three'},
              {text: 'four'}
            ]
          }
        ]
      })
    }
    it('passes all normalized messaging events to handler', function () {
      const callback = sinon.stub().callsFake((error, response) => {
        assert.notExists(error)
        expect(response.statusCode).to.equal(204)
      })
      const normalizer = sinon.stub().returns('normalized_event')
      const handler = sinon.stub()

      lambda.main(event, handler, normalizer, callback)
      assert(callback.calledOnce)
      expect(normalizer.callCount).to.equal(4)
      expect(handler.callCount).to.equal(4)
      for (let i = 0; i < 4; i++) expect(handler.getCall(i)).to.have.been.calledWith('normalized_event')
    })

    it('ignores events not concering a page', function () {
      const invalidEvent = {body: JSON.stringify({object: 'foo'})}
      const callback = sinon.stub().callsFake((error, response) => {
        assert.notExists(error)
        expect(response.statusCode).to.equal(400)
      })
      const normalizer = sinon.stub()
      const handler = sinon.stub()

      lambda.main(invalidEvent, handler, normalizer, callback)
      assert(callback.calledOnce)
      expect(normalizer.callCount).to.equal(0)
      expect(handler.callCount).to.equal(0)
    })

    it('ignores events without JSON.parse()-able body', function () {
      const invalidEvent = {body: ''}
      const callback = sinon.stub().callsFake((error, response) => {
        assert.notExists(error)
        expect(response.statusCode).to.equal(400)
      })
      const normalizer = sinon.stub()
      const handler = sinon.stub()
      sinon.stub(console, 'error').callsFake(_ => {})

      lambda.main(invalidEvent, handler, normalizer, callback)
      assert(callback.calledOnce)
      expect(normalizer.callCount).to.equal(0)
      expect(handler.callCount).to.equal(0)
      console.error.restore()
    })
  })

  describe('verification', function () {
    const challenge = '1234'
    process.env.FB_MESSENGER_VERIFICATION_TOKEN = 'foobarbaz'
    it('verifies the correct token using the challenge', function () {
      const event = {
        queryStringParameters: {
          'hub.verify_token': process.env.FB_MESSENGER_VERIFICATION_TOKEN,
          'hub.challenge': challenge
        }
      }
      lambda.verify(event, (error, response) => {
        assert.notExists(error)
        expect(response.statusCode).to.equal(200)
        expect(response.body).to.equal(challenge)
      })
    })

    it('denies wrong token', function () {
      const event = {
        queryStringParameters: {
          'hub.verify_token': 'wrong-token',
          'hub.challenge': challenge
        }
      }
      lambda.verify(event, (error, response) => {
        assert.notExists(error)
        expect(response.statusCode).to.equal(401)
      })
    })

    it('denies missing challenge', function () {
      const event = {
        queryStringParameters: {
          'hub.verify_token': process.env.FB_MESSENGER_VERIFICATION_TOKEN
        }
      }
      lambda.verify(event, (error, response) => {
        assert.notExists(error)
        expect(response.statusCode).to.equal(401)
      })
    })
  })
})

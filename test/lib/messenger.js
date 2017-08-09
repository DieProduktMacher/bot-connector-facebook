'use strict'

describe('messenger', function () {
  const messenger = libRequire('messenger')
  const recipient = 'recipient'
  describe('building messenger request data', function () {
    describe('messenger.build.typing', function () {
      it('returns a data for typing requests', function () {
        expect(messenger.build.typing(recipient, 'on')).to.eql({recipient, sender_action: 'typing_on'})
        expect(messenger.build.typing(recipient, 'off')).to.eql({recipient, sender_action: 'typing_off'})
      })
    })

    describe('messenger.build.message', function () {
      it('returns data for message requests', function () {
        const message = {foo: 'foo'}
        expect(messenger.build.message(recipient, message)).to.eql({recipient, message})
      })
    })

    describe('messenger.build.messages', function () {
      it('returns array data for message requests', function () {
        const one = {foo: 'one'}
        const two = {foo: 'two'}
        sinon.spy(messenger.build, 'message')
        messenger.build.messages(recipient, [one, two])
        assert(messenger.build.message.calledTwice)
        expect(messenger.build.message).to.have.been.calledWith(recipient, one)
        expect(messenger.build.message).to.have.been.calledWith(recipient, two)
        messenger.build.message.restore()
      })
    })

    describe('messenger.build.text', function () {
      it('returns data for a text message requests', function () {
        const text = 'text'
        expect(messenger.build.text(recipient, text)).to.eql({recipient, message: {text}})
      })
    })

    describe('messenger.build.text', function () {
      it('returns array data for text requests', function () {
        const one = 'one'
        const two = 'two'
        sinon.spy(messenger.build, 'text')
        messenger.build.texts(recipient, [one, two])
        assert(messenger.build.text.calledTwice)
        expect(messenger.build.text).to.have.been.calledWith(recipient, one)
        expect(messenger.build.text).to.have.been.calledWith(recipient, two)
        messenger.build.text.restore()
      })
    })
  })

  describe('sending messenger requests to facebook', function () {
    let messenger
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

      messenger = libRequire('messenger')
    })

    afterEach(function () {
      mockery.deregisterAll()
      mockery.disable()
    })

    describe('messenger.send.one()', function () {
      const expectedRequestData = (json) => ({
        uri: `${process.env.FB_API_URL}/me/messages`,
        method: 'POST',
        qs: {access_token: process.env.FB_PAGE_ACCESS_TOKEN},
        json
      })

      it('sends the request with given data to the facebook messages api', function () {
        const json = {foo: 'foo'}
        request.callsFake(() => Promise.resolve())
        return messenger.send.one(json)
          .then(_ => {
            assert(request.calledOnce)
            expect(request).to.have.been.calledWith(expectedRequestData(json))
          })
      })

      describe('unsuccessful requests', function () {
        beforeEach(function () {
          // do not log errors to the console
          sinon.stub(console, 'error')
        })
        afterEach(function () {
          // restore console.error
          console.error.restore()
        })
        it('catches unsuccessful requests', function () {
          const json = {foo: 'foo'}
          request.callsFake(() => Promise.reject('error')) // eslint-disable-line prefer-promise-reject-errors
          expect(() => messenger.send.one(json)).to.not.throw()
        })
      })
    })

    describe('messenger.send.all()', function () {
      it('sends request for all entries in the correct order from data array', function () {
        sinon.stub(messenger.send, 'one').callsFake(() => Promise.resolve())
        const one = {one: 'one'}
        const two = {two: 'two'}
        return messenger.send.all([one, two]).then(_ => {
          assert(messenger.send.one.calledTwice)
          expect(messenger.send.one.firstCall).to.have.been.calledWith(one)
          expect(messenger.send.one.secondCall).to.have.been.calledWith(two)
          messenger.send.one.restore()
        })
      })
    })

    describe('response functions', function () {
      beforeEach(function () {
        sinon.stub(messenger.send, 'one')
        sinon.stub(messenger.send, 'all')
      })

      afterEach(function () {
        messenger.send.one.restore()
        messenger.send.all.restore()
      })

      describe('messenger.response.typingOn()', function () {
        it('builds and send the data for typingOn', function () {
          sinon.stub(messenger.build, 'typing').returns('typing_on')
          messenger.response.typingOn(recipient)
          assert(messenger.build.typing.calledOnce)
          expect(messenger.build.typing).to.have.been.calledWith(recipient, 'on')
          assert(messenger.send.one.calledOnce)
          expect(messenger.send.one).to.have.been.calledWith('typing_on')
          messenger.build.typing.restore()
        })
      })

      describe('messenger.response.typingOff()', function () {
        it('builds and send the data for typingOn', function () {
          sinon.stub(messenger.build, 'typing').returns('typing_off')
          messenger.response.typingOff(recipient)
          assert(messenger.build.typing.calledOnce)
          expect(messenger.build.typing).to.have.been.calledWith(recipient, 'off')
          assert(messenger.send.one.calledOnce)
          expect(messenger.send.one).to.have.been.calledWith('typing_off')
          messenger.build.typing.restore()
        })
      })

      describe('messenger.response.message()', function () {
        it('builds and send the data for message', function () {
          sinon.stub(messenger.build, 'message').returns('message')
          messenger.response.message(recipient, {foo: 'foo'})
          assert(messenger.build.message.calledOnce)
          expect(messenger.build.message).to.have.been.calledWith(recipient, {foo: 'foo'})
          assert(messenger.send.one.calledOnce)
          expect(messenger.send.one).to.have.been.calledWith('message')
          messenger.build.message.restore()
        })
      })

      describe('messenger.response.messages()', function () {
        it('builds and send the data for all messages', function () {
          const messages = [{one: 'one'}, {two: 'two'}]
          sinon.stub(messenger.build, 'messages').returns('built_messages')
          messenger.response.messages(recipient, [{one: 'one'}, {two: 'two'}])
          assert(messenger.build.messages.calledOnce)
          expect(messenger.build.messages).to.have.been.calledWith(recipient, messages)
          assert(messenger.send.all.calledOnce)
          expect(messenger.send.all).to.have.been.calledWith('built_messages')
          messenger.build.messages.restore()
        })
      })

      describe('messenger.response.text', function () {
        it('builds and send the data for message', function () {
          sinon.stub(messenger.build, 'text').returns('built_text')
          messenger.response.text(recipient, 'foo')
          assert(messenger.build.text.calledOnce)
          expect(messenger.build.text).to.have.been.calledWith(recipient, 'foo')
          assert(messenger.send.one.calledOnce)
          expect(messenger.send.one).to.have.been.calledWith('built_text')
          messenger.build.text.restore()
        })
      })

      describe('messenger.response.texts()', function () {
        it('builds and sends the data for all texts', function () {
          const texts = ['one', 'two']
          sinon.stub(messenger.build, 'texts').returns('built_texts')
          messenger.response.texts(recipient, texts)
          assert(messenger.build.texts.calledOnce)
          expect(messenger.build.texts).to.have.been.calledWith(recipient, texts)
          assert(messenger.send.all.calledOnce)
          expect(messenger.send.all).to.have.been.calledWith('built_texts')
          messenger.build.texts.restore()
        })
      })
    })
  })
})

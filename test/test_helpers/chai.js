'use strict'

const chai = require('chai')

chai.use(require('sinon-chai'))
chai.config.includeStack = true

global.expect = chai.expect
global.assert = chai.assert
global.AssertionError = chai.AssertionError
global.Assertion = chai.Assertion

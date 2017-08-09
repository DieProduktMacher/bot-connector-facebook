# Bot Connector Facebook

[![Build Status](https://travis-ci.org/DieProduktMacher/bot-connector-facebook.svg?branch=master)](https://travis-ci.org/DieProduktMacher/connector-facebook)[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Bot connector for facebook which can be used with the[`bot-worker-engine`](https://github.com/DieProduktMacher/bot-worker-engine) on AWS-Lambda

## Installation

```
npm install bot-connector-facebook
```

## Usage

```javascript
const {
  lambda,
  normalize,
  response,
  userData
} = require('bot-connector-facebook')

const workers = require('./workers') // your bot specific workers
const persistence = require('<persistence-layer>')


const handler = (input) => {
  // handle the normalized input, i.e. with https://github.com/DieProduktMacher/bot-worker-engine
  orchestrate({input, workers, persistence, response, userData})
}

module.exports = {
  main: (event, _, callback) => {
    lambda.main(event, handler, normalize, callback)
  },
  verify: (event, _, callback) => {
    lambda.verify(event, callback)
  }
}
```

## License

[MIT](./LICENSE)

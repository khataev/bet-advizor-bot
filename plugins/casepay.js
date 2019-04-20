const request = require('request-promise')
// require('request-promise').debug = true

const settings = require('./config')
const logger = require('./logger')

const sciId = settings.get('credentials.casepay.merchant.sci_id')
const sciKey = settings.get('credentials.casepay.merchant.sci_key')
const CARD_PAYMENT_METHOD = 'card_rub'
const YANDEX_PAYMENT_METHOD = 'yandexmoney_rub'

function mergeArray(array1, array2) {
  for (const item in array1) {
    array2[item] = array1[item]
  }
  return array2
}

function parseJSONBody(data) {
  return JSON.parse(data)
}
function logData(data) {
  console.log('logData', data)

  return data
}

function Casepay(sciId, sciKey) {
  this.sciId = sciId
  this.sciKey = sciKey
  // this.domain = domain
  // this.test = test || false
}
Casepay.methods = ['sci_create_order', 'sci_confirm_order']
Casepay.prototype.sendRequest = function(method, params) {
  if (Casepay.methods.indexOf(method) === -1) {
    throw new Error('wrong method name ' + method)
  }

  let data = {
    func: method,
    sci_id: this.sciId,
    sci_key: this.sciKey
    // domain: this.domain,
    // test: this.test
  }
  data = mergeArray(params, data)

  const options = {
    method: 'POST',
    uri: 'https://casepay.online/sci/0.1/index.php',
    // uri: 'https://postman-echo.com/post',
    qs: data,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return request(options)
    .then(parseJSONBody)
    .then(body => {
      if (body.error) {
        logger.error(body)
        throw new Error(`Casepay error: ${body.message}`)
      } else {
        return {
          error: body.error,
          url: body.data.url,
          hash: body.data.params.hash
        }
      }
    })
    .then(logData)
    .catch(error => {
      return {
        error: true,
        message: error.message
      }
    })
}

for (let i = 0; i < Casepay.methods.length; i++) {
  Casepay.prototype[Casepay.methods[i]] = (function(method) {
    return function(params) {
      return this.sendRequest(method, params)
    }
  })(Casepay.methods[i])
}

module.exports = {
  casepay: new Casepay(sciId, sciKey),
  // TODO: to lower case?
  PaymentMethods: {
    CARD_PAYMENT_METHOD,
    YANDEX_PAYMENT_METHOD
  }
}

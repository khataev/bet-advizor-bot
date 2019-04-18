const https = require('https')
const querystring = require('querystring')

const settings = require('./config')

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

function defaultCallback(data) {
  console.log(data)
}

function Casepay(sciId, sciKey) {
  this.sciId = sciId
  this.sciKey = sciKey
  // this.domain = domain
  // this.test = test || false
}
Casepay.methods = ['sci_create_order', 'sci_confirm_order']
Casepay.prototype.sendRequest = function(method, params, callback) {
  if (Casepay.methods.indexOf(method) === -1) {
    throw new Error('wrong method name ' + method)
  }

  if (callback == null) {
    // callback = params
    callback = defaultCallback
  }

  let data = {
    func: method,
    sciId: this.sciId,
    sciKey: this.sciKey
    // domain: this.domain,
    // test: this.test
  }
  data = mergeArray(params, data)

  const requestParams = querystring.stringify(data)

  const options = {
    host: 'casepay.online',
    // host: 'postman-echo.com',
    port: 443,
    path: `/sci/0.1/index.php?${requestParams}`,
    // path: `/post?${body}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const request = https.request(options, function(response) {
    let result = ''
    response.setEncoding('utf8')

    response.on('data', function(chunk) {
      result += chunk
    })

    // Listener for intializing callback after receiving complete response
    response.on('end', function() {
      try {
        callback(JSON.parse(result))
        // callback(result)
      } catch (e) {
        console.error(e)
        callback(result)
      }
    })
  })
  request.end()
}

for (let i = 0; i < Casepay.methods.length; i++) {
  Casepay.prototype[Casepay.methods[i]] = (function(method) {
    return function(params, callback) {
      this.sendRequest(method, params, callback)
    }
  })(Casepay.methods[i])
}

module.exports = {
  casepay: new Casepay(sciId, sciKey),
  payment_methods: {
    CARD_PAYMENT_METHOD,
    YANDEX_PAYMENT_METHOD
  }
}

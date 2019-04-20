const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const passport = require('passport')

const constants = require('../plugins/constants')
const logger = require('../plugins/logger')
const settings = require('../plugins/config')
const telegramApi = require('../plugins/telegram')
const util = require('../plugins/util')
const models = require('../plugins/db/models')
const packageInfo = require('../package.json')

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  logger.warn('start_express_server')
  // TODO: move middleware initialization to function
  const app = express()
  const api_tokens = settings.get('credentials.telegram_bot.api_tokens')
  // Here we are configuring express to use body-parser as middle-ware.
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  app.use(
    session({
      name: 'advizor_bot_session',
      // TODO: real secret key
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      proxy: !config.dev,
      cookie: { secure: !config.dev }
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())

  app.get('/version', function(req, res) {
    console.debug('get /')
    res.json({ version: packageInfo.version })
  })

  api_tokens.forEach(codeToken => {
    // console.log('1', telegramApi)
    // console.log('2', telegramApi.parseBotCodeToken)
    const { code, token } = telegramApi.parseBotCodeToken(codeToken)

    app.post(`/${token}`, function(req, res) {
      logger.debug(req.body)
      telegramApi.processUpdate(req.body, code)
      res.sendStatus(200)
    })

    app.post(`/${token}/handler`, async function(req, res) {
      logger.debug('handler action')
      logger.debug(req.body)

      const { private_hash: privateHash, order_id: orderId } = req.body
      await models.Payment.updatePrivateHash(orderId, privateHash)

      res.sendStatus(200)
    })

    app.get(`/${token}/success`, function(req, res) {
      console.debug(`get /${token}/success`)
      logger.debug('success action')
      logger.debug(req.body)
      res.sendStatus(200)
    })

    app.get(`/${token}/failure`, function(req, res) {
      logger.debug('failure action')
      logger.debug(req.body)
      res.sendStatus(200)
    })
  })

  // const port = settings.isProductionEnv() ? process.env.PORT : 8000

  // const server = app.listen(port, function() {
  //   const host = server.address().address
  //   const port = server.address().port
  //
  //   console.log(`Server started at http://${host}:${port}`)
  // })

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()

// TODO: what is the diff with require?
import express from 'express'
const { DateTime } = require('luxon')

const config = require('../../nuxt.config.js')
const logger = require('./../../plugins/logger')

// TODO: how to alias models without relative path?
const models = require('./../../plugins/db/models')
const Bot = models.Bot
const User = models.User
const Subscriber = models.Subscriber
const Op = models.Sequelize.Op

const telegramApi = require('./../../plugins/telegram')

// Create express router
const router = express.Router()

function invalidSession(session) {
  // HINT: turned off in development
  if (config.dev) return false

  if (!session) return true
  const expired = session.cookie.expires
    ? DateTime.fromJSDate(session.cookie.expires) < DateTime.local()
    : false

  return expired || !session.authUser
}

function constructWhereClause(botId, chatId, showOnlyActive) {
  const whereClause = {}

  if (botId) whereClause.botId = botId

  if (showOnlyActive) {
    whereClause.currentValidTill = {
      [Op.gte]: DateTime.local().toJSDate()
    }
  }

  if (chatId) whereClause.chatId = { [Op.eq]: chatId }

  return whereClause
}

// Transform req & res to have the same API as express
// So we can use res.status() & res.json()
const app = express()
router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

// Add POST - /api/login
router.post('/login', (req, res) => {
  User.findOne({ where: { email: req.body.email.toLowerCase() } })
    .then(user => {
      if (user && user.verifyPassword(req.body.password)) {
        const authUser = {
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin
        }
        req.session.authUser = authUser
        req.session.cookie.expires = DateTime.local()
          .plus({ hours: 12 })
          .toJSDate()
        return res.json(authUser)
      } else {
        res.status(401).json({ message: 'Bad credentials' })
      }
    })
    .catch(() => res.status(401).json({ message: 'Bad credentials' }))
})

// Create User
router.post('/users', async (req, res) => {
  if (invalidSession(req.session)) return res.sendStatus(401)

  try {
    const { email, name, password, passwordConfirmation } = req.body
    const user = User.build({
      email: email,
      name: name,
      password: password,
      passwordConfirmation: passwordConfirmation
    })
    user.encryptPassword()
    await user.save()
    res.status(200).json({ ok: true, message: 'SUCCESS' })
  } catch (error) {
    res.json({ ok: false, message: 'FAILURE', error_message: error.message })
  }
})

// Add POST - /api/logout
router.post('/logout', (req, res) => {
  // delete req.session.authUser
  req.session.destroy()
  res.json({ ok: true })
})

router.get('/bots', (req, res) => {
  if (invalidSession(req.session)) return res.sendStatus(401)

  // res.json([{ value: 'ruha_bot', name: 'Ruha Stavit BOT' }])
  Bot.findAll().then(bots => {
    const botOptions = bots.map(bot => {
      return { id: bot.id, code: bot.code, name: bot.name }
    })
    res.json(botOptions)
  })
})

router.get('/bots/:botId/subscribers', (req, res) => {
  if (invalidSession(req.session)) return res.sendStatus(401)

  const botId = req.params.botId
  let { page, limit, showOnlyActive, telegramId: chatId } = req.query
  showOnlyActive = showOnlyActive === 'true'
  page = page || 1
  limit = limit || 10
  const offset = (page - 1) * limit
  logger.debug(`page, ${page}, limit, ${limit}`)
  if (!botId) return res.json({})

  const whereClause = constructWhereClause(botId, chatId, showOnlyActive)

  Subscriber.findAll({
    where: whereClause,
    attributes: [
      [models.sequelize.fn('COUNT', models.sequelize.col('*')), 'cnt']
    ],
    raw: true
  }).then(rows => {
    res.set('x-total-count', rows[0].cnt)
    res.set('x-per-page', limit)
  })

  Subscriber.findAll({
    where: whereClause,
    order: [['createdAt', 'asc']],
    offset: offset,
    limit: limit
  }).then(subscribers => {
    res.json(
      subscribers.map(item => {
        return {
          email: item.email,
          chatId: item.chatId,
          activeSubscription: item.isActiveSubscription()
        }
      })
    )
  })
})

router.post('/send_message', (req, res) => {
  if (invalidSession(req.session)) return res.sendStatus(401)

  const { botCode, messageText, showOnlyActive, telegramId: chatId } = req.body
  const whereClause = constructWhereClause(null, chatId, showOnlyActive)
  if (!messageText) return

  try {
    telegramApi.sendToTelegram(messageText, {}, botCode, whereClause)
    res.json({ ok: true, message: 'SUCCESS' })
  } catch (e) {
    console.log(e.message)
    res.json({ ok: false, message: 'FAILURE', error_message: e.message })
  }
})

// Export the server middleware
export default {
  path: '/api',
  handler: router
}

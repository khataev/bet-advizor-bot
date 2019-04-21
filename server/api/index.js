// TODO: what is the diff with require?
import express from 'express'

const { DateTime } = require('luxon')

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
  if (!session) return true
  const expired = session.cookie.expires
    ? DateTime.fromJSDate(session.cookie.expires) < DateTime.local()
    : false

  return expired || !session.authUser
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
  User.findOne({ where: { email: req.body.email } })
    .then(user => {
      if (user && user.verifyPassword(req.body.password)) {
        const authUser = { email: user.email, name: user.name }
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
  let { page, limit } = req.query
  page = page || 1
  limit = limit || 10
  const offset = (page - 1) * limit
  logger.debug(`page, ${page}, limit, ${limit}`)
  if (!botId) return res.json({})

  Subscriber.findAll({
    where: { botId: botId },
    attributes: [
      [models.sequelize.fn('COUNT', models.sequelize.col('*')), 'cnt']
    ],
    raw: true
  }).then(rows => {
    res.set('x-total-count', rows[0].cnt)
    res.set('x-per-page', limit)
  })

  Subscriber.findAll({
    where: { botId: botId },
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

  const { botCode, messageText, onlyActive } = req.body
  const whereClause = {}
  if (!messageText) return

  try {
    if (onlyActive) {
      whereClause.currentValidTill = { [Op.gte]: new Date() }
    }
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

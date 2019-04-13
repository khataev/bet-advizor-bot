import express from 'express'
// TODO: how to alias models without relative path?
const models = require('./../../plugins/db/models')
const Bot = models.Bot
const User = models.User

// Create express router
const router = express.Router()

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
        return res.json(authUser)
      } else {
        res.status(401).json({ message: 'Bad credentials' })
      }
    })
    .catch(() => res.status(401).json({ message: 'Bad credentials' }))
})

// Add POST - /api/logout
router.post('/logout', (req, res) => {
  delete req.session.authUser
  // req.session.destroy()
  res.json({ ok: true })
})

router.get('/bots', (req, res) => {
  // res.json([{ value: 'ruha_bot', name: 'Ruha Stavit BOT' }])
  Bot.findAll().then(bots => {
    const botOptions = bots.map(bot => {
      return { code: bot.code, name: bot.name }
    })
    res.json(botOptions)
  })
})

// Export the server middleware
export default {
  path: '/api',
  handler: router
}

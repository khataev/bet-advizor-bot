import express from 'express'
const Sequelize = require('sequelize')
const settings = require('./../../plugins/config')
const database = require('./../../plugins/config/database')
const sequelize = new Sequelize(database[settings.get('env')])
const User = sequelize.import('./../../plugins/db/models/user')

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
        const authUser = { email: user.email }
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

// Export the server middleware
export default {
  path: '/api',
  handler: router
}

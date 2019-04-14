'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/database.js')[env]
const db = {}

const sequelize = new Sequelize(config)

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    )
  })
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

async function* batch(query = { batchSize: 1000 }) {
  const count = await this.count(query)

  if (count === 0) {
    return false
  }
  const pagesRemainder = count % query.batchSize ? 1 : 0
  const pages = Math.floor(count / query.batchSize) + pagesRemainder
  let page = 1

  const params = Object.assign({}, query)
  while (page <= pages) {
    params.offset = (page - 1) * query.batchSize
    params.limit = query.batchSize

    yield await this.findAll(params)
    page = page + 1
  }
}

Sequelize.Model.batch = batch

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db

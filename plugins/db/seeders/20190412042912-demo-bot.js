'use strict'
const models = require('./../models')
const Bot = models.Bot

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Bot.create({ code: 'ruha_stavit_test_bot', name: 'Ruha Stavit Bot' })
    return Bot.create({
      code: 'myach_prodakshn_test_bot',
      name: 'Мяч Продакшн Бот'
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Bots', null, {})
  }
}

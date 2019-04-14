'use strict'
const util = require('./../../util')
const models = require('./../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bots = await models.Bot.findAll({})
    await util.asyncForEach(bots, async (i, bot) => {
      const subscriber = models.Subscriber.build({
        botId: bot.id,
        email: 'khataev@yandex.ru',
        chatId: 176212258,
        activeSubscription: true
      })
      await subscriber.save()
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Subscribers', null, {})
  }
}

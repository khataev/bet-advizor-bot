'use strict'
const util = require('./../../util')
const models = require('./../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bots = await models.Bot.findAll({})
    const subscribers = Array(23)
    await util.asyncForEach(bots, async (i, bot) => {
      // HINT: real subscriber
      const subscriber = models.Subscriber.build({
        botId: bot.id,
        email: 'khataev@yandex.ru',
        chatId: 176212258,
        activeSubscription: true
      })
      await subscriber.save()

      // HINT: dummy subscribers for pagination
      await util.asyncForEach(subscribers, async i => {
        let dummySubscriber = models.Subscriber.build({
          botId: bot.id,
          email: `subscriber-${i + 1}@mail.ru`,
          chatId: 176212258 + i + 1,
          activeSubscription: !(i % 2)
        })
        await dummySubscriber.save()
      })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Subscribers', null, {})
  }
}

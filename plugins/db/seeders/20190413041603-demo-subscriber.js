'use strict'
const models = require('./../models')
const util = require('./../../util')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bots = await models.Bot.findAll({})
    const subscribers = Array(23)
    await util.asyncForEach(bots, async (i, bot) => {
      // HINT: real subscriber (ME)
      const subscriber1 = models.Subscriber.build({
        botId: bot.id,
        email: 'khataev@yandex.ru',
        chatId: 176212258
        // activeSubscription: true
      })
      await subscriber1.save()

      // HINT: real subscriber (Alexey)
      const subscriber2 = models.Subscriber.build({
        botId: bot.id,
        email: 'alex.korinenko@list.ru',
        chatId: 556745162
        // activeSubscription: true
      })
      await subscriber2.save()

      // HINT: dummy subscribers for pagination
      return util.asyncForEach(subscribers, async i => {
        const dummySubscriber = models.Subscriber.build({
          botId: bot.id,
          email: `subscriber-${i + 1 + bot.id * 100}@mail.ru`,
          chatId: 176212258 + i + 1 + bot.id * 100
          // activeSubscription: false
        })
        await dummySubscriber.save()
      })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Subscribers', null, {})
  }
}

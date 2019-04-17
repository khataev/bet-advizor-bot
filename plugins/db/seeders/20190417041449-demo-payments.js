'use strict'
const { DateTime } = require('luxon')

const constants = require('./../../constants')
const models = require('./../models')
const util = require('./../../util')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const subscribers = await models.Subscriber.findAll({
      where: { email: ['khataev@yandex.ru', 'alex.korinenko@list.ru'] }
    })
    return util.asyncForEach(subscribers, async (i, subscriber) => {
      const paidAt = DateTime.local()
      const validTill = paidAt.plus({
        days: constants.SUBSCRIPTION_DURATION_DAYS
      })
      const payment = models.Payment.build({
        subscriberId: subscriber.id,
        amount: 3500,
        paidAt: paidAt
      })
      subscriber.currentPaidAt = paidAt
      // subscriber.currentValidTill = subscriber.email == 'khataev@yandex.ru' ? validTill : DateTime.local()
      subscriber.currentValidTill = validTill
      await payment.save()
      await subscriber.save()
    })
  },
  down: async (queryInterface, Sequelize) => {
    const subscribers = await models.Subscriber.findAll({
      where: { email: ['khataev@yandex.ru', 'alex.korinenko@list.ru'] }
    })
    await util.asyncForEach(subscribers, async (i, subscriber) => {
      subscriber.currentPaidAt = null
      subscriber.currentValidTill = null
      await subscriber.save()
    })
    return queryInterface.bulkDelete('Payments', null, {})
  }
}

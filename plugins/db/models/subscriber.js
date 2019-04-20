'use strict'

const { DateTime } = require('luxon')

const logger = require('./../../logger')
const settings = require('./../../config')

module.exports = (sequelize, DataTypes) => {
  const Subscriber = sequelize.define(
    'Subscriber',
    {
      botId: { field: 'bot_id', type: DataTypes.INTEGER },
      email: DataTypes.STRING,
      chatId: { field: 'chat_id', type: DataTypes.INTEGER },
      currentPaidAt: { field: 'current_paid_at', type: DataTypes.DATE },
      currentValidTill: { field: 'current_valid_till', type: DataTypes.DATE }
      // activeSubscription: {
      //   field: 'active_subscription',
      //   type: DataTypes.BOOLEAN
      // }
    },
    {}
  )
  Subscriber.associate = function(models) {
    Subscriber.hasMany(models.Payment, { foreignKey: 'subscriber_id' })
  }

  Subscriber.prototype.isActiveSubscription = function() {
    return (
      !!this.getDataValue('currentValidTill') &&
      this.getDataValue('currentValidTill') >= DateTime.local()
    )
  }

  Subscriber.prototype.updatePaymentData = function(paidAt) {
    const subscriptionDuration = settings.get('subscription_duration')
    const validTill = paidAt.plus({ months: subscriptionDuration })
    return this.update({
      currentPaidAt: paidAt.toJSDate(),
      currentValidTill: validTill.toJSDate()
    })
  }

  Subscriber.createNewOrder = async function(botId, chatId, amount) {
    let subscriber = await Subscriber.findOne({
      where: { botId: botId, chatId: chatId }
    })

    return Subscriber.sequelize
      .transaction({}, async transaction => {
        if (!subscriber)
          subscriber = await Subscriber.create(
            { botId: botId, chatId: chatId },
            { transaction: transaction }
          )

        return subscriber.createPayment(
          { amount: amount },
          { transaction: transaction }
        )
      })
      .then(payment => {
        logger.debug(`Payment with id=${payment.id} created`)
        return payment
      })
      .catch(error => logger.error(error))
  }

  return Subscriber
}

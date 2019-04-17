'use strict'

const { DateTime } = require('luxon')

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
    // associations can be defined here
  }

  Subscriber.prototype.activeSubscription = function() {
    return (
      !!this.getDataValue('currentValidTill') &&
      this.getDataValue('currentValidTill') >= DateTime.local()
    )
  }

  return Subscriber
}

'use strict'
module.exports = (sequelize, DataTypes) => {
  const Subscriber = sequelize.define(
    'Subscriber',
    {
      botId: { field: 'bot_id', type: DataTypes.INTEGER },
      email: DataTypes.STRING,
      chatId: { field: 'chat_id', type: DataTypes.INTEGER },
      activeSubscription: {
        field: 'active_subscription',
        type: DataTypes.BOOLEAN
      }
    },
    {}
  )
  Subscriber.associate = function(models) {
    // associations can be defined here
  }
  return Subscriber
}

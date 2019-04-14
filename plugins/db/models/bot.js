'use strict'
module.exports = (sequelize, DataTypes) => {
  const Bot = sequelize.define(
    'Bot',
    {
      name: DataTypes.STRING,
      code: DataTypes.STRING
    },
    {}
  )
  Bot.associate = function(models) {
    // associations can be defined here
    // TODO: finish
    Bot.hasMany(models.Subscriber, { foreignKey: 'bot_id' })
  }
  return Bot
}

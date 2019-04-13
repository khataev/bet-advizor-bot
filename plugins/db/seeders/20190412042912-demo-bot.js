'use strict'
const models = require('./../models')

module.exports = {
  up: (queryInterface, Sequelize) => {
    const Bot = models.Bot
    return Bot.create({ code: 'ruha_stavit_bot', name: 'Ruha Stavit Bot' })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Bot', { code: 'ruha_stavit_bot' }, {})
  }
};

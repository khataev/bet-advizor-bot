'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Subscribers', 'current_paid_at', {
      type: Sequelize.DATE
    })
    await queryInterface.addColumn('Subscribers', 'current_valid_till', {
      type: Sequelize.DATE
    })
    return queryInterface.addIndex('Subscribers', {
      fields: ['current_valid_till']
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Subscribers', 'current_paid_at')
    return queryInterface.removeColumn('Subscribers', 'current_valid_till')
  }
}

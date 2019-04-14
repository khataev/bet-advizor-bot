'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Subscribers', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        bot_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'Bots',
            key: 'id',
            deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
          },
          allowNull: false
        },
        email: {
          type: Sequelize.STRING
        },
        chat_id: {
          type: Sequelize.INTEGER
        },
        active_subscription: {
          type: Sequelize.BOOLEAN
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .then(() =>
        queryInterface.addIndex('Subscribers', ['bot_id', 'email'], {
          unique: true
        })
      )
      .then(() =>
        queryInterface.addIndex('Subscribers', ['bot_id', 'chat_id'], {
          unique: true
        })
      )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Subscribers')
  }
}

'use strict'
const models = require('./../models')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const User = models.User
    const user1 = User.build({
      email: 'demo@example.com',
      name: 'Demo User',
      password: 'demo',
      passwordConfirmation: 'demo'
    })
    user1.encryptPassword()
    await user1.save()

    const user2 = User.build({
      email: 'khataev@yandex.ru',
      name: 'Andrey Khataev',
      password: '123',
      passwordConfirmation: '123'
    })
    user2.encryptPassword()
    return user2.save()
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}

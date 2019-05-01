'use strict'
const models = require('./../models')
const User = models.User

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const user1 = User.build({
      email: 'admin@example.com',
      name: 'Demo Admin',
      password: 'demo',
      passwordConfirmation: 'demo',
      isAdmin: true
    })
    user1.encryptPassword()
    await user1.save()

    const user2 = User.build({
      email: 'user@example.com',
      name: 'Demo User',
      password: 'demo',
      passwordConfirmation: 'demo',
      isAdmin: false
    })
    user2.encryptPassword()
    await user2.save()

    const user3 = User.build({
      email: 'khataev@yandex.ru',
      name: 'Andrey Khataev',
      password: '123',
      passwordConfirmation: '123',
      isAdmin: true
    })
    user3.encryptPassword()
    return user3.save()
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {})
  }
}

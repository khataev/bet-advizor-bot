'use strict'
const bcrypt = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      email: DataTypes.STRING,
      encryptedPassword: {
        field: 'encrypted_password',
        type: DataTypes.STRING
      },
      isAdmin: {
        field: 'is_admin',
        type: DataTypes.BOOLEAN
      },
      password: DataTypes.VIRTUAL,
      passwordConfirmation: DataTypes.VIRTUAL,
      name: DataTypes.STRING
    },
    {}
  )
  User.associate = function(models) {
    // associations can be defined here
  }
  // instance methods are defined on the model's .prototype
  User.prototype.encryptPassword = function() {
    const password = this.getDataValue('password')
    const confirmation = this.getDataValue('passwordConfirmation')
    if (password && confirmation && password === confirmation) {
      const encryptedPassword = bcrypt.hashSync(password, 10)
      this.setDataValue('encryptedPassword', encryptedPassword)
      return true
    } else {
      return false
    }
  }
  User.prototype.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.getDataValue('encryptedPassword'))
  }

  return User
}

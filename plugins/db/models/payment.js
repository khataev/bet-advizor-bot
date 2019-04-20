'use strict'
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      subscriberId: { field: 'subscriber_id', type: DataTypes.INTEGER },
      amount: DataTypes.INTEGER,
      privateHash: { field: 'private_hash', type: DataTypes.STRING },
      paidAt: { field: 'paid_at', type: DataTypes.DATE }
    },
    {}
  )
  Payment.associate = function(models) {
    // associations can be defined here
  }

  Payment.updatePrivateHash = function(orderId, privateHash) {
    return this.update(
      {
        privateHash: privateHash
      },
      {
        where: {
          id: {
            [sequelize.Sequelize.Op.eq]: orderId
          }
        }
      }
    )
  }

  return Payment
}

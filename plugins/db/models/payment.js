'use strict'
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      subscriberId: { field: 'subscriber_id', type: DataTypes.INTEGER },
      amount: DataTypes.INTEGER,
      paidAt: { field: 'paid_at', type: DataTypes.DATE }
    },
    {}
  )
  Payment.associate = function(models) {
    // associations can be defined here
  }
  return Payment
}

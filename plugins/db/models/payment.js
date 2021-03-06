'use strict'

const { DateTime } = require('luxon')

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
    Payment.belongsTo(models.Subscriber, { foreignKey: 'subscriber_id' })
  }

  Payment.confirmPayment = async function(orderId, privateHash) {
    const payment = await Payment.findOne({
      where: {
        id: {
          [sequelize.Sequelize.Op.eq]: orderId
        }
      }
    })
    if (payment) {
      return Payment.sequelize.transaction({}, async transaction => {
        const paidAt = DateTime.local()
        await payment.update({
          privateHash: privateHash,
          paidAt: paidAt.toJSDate()
        })
        return (await payment.getSubscriber()).updatePaymentData(paidAt)
      })
    } else {
      throw new Error(`Payment with id=${orderId} not found`)
    }
  }

  return Payment
}

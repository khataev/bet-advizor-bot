const settings = require('./config')
const logger = require('./logger')
const models = require('./db/models')
const { casepay, PAYMENT_METHODS } = require('./casepay')

// TODO: move to 'this' properties
let cache, bots, telegramApi

const wizard = function(cache_param, bots_param, telegram_api_param) {
  cache = cache_param
  bots = bots_param
  telegramApi = telegram_api_param

  this.payWizardStarted = (chat_id, code) => {
    return cache.exists(`pay_wizard_${code}_${chat_id}`)
  }

  this.getPayWizard = (chat_id, code) => {
    return cache.get(`pay_wizard_${code}_${chat_id}`)
  }

  this.startPayWizard = (chat_id, code) => {
    cache.add(`pay_wizard_${code}_${chat_id}`, { step: 1 })
  }

  this.stopPayWizard = (chat_id, code) => {
    cache.delete(`pay_wizard_${code}_${chat_id}`)
  }

  this.handlePayWizardStep = async (chat_id, code, options) => {
    const wizard = this.getPayWizard(chat_id, code)

    switch (wizard.step) {
      case 0:
        bots[code].sendMessage(chat_id, options)
        this.gotoNextStep(wizard)
        break
      case 1:
        bots[code].sendMessage(
          chat_id,
          'Введите правильный e-mail\n' + '(Пример: user@yandex.ru)'
        )
        this.gotoNextStep(wizard)
        // console.log(wizard.step, this.getPayWizard(chat_id, code).step)
        break
      case 2:
        if (!options) break

        try {
          // TODO: move email check to method
          if (options.search(/\w+@\w+\.\w{2,}/) === -1) {
            this.gotoPrevStep(wizard)
            this.handlePayWizardStep(chat_id, code)
          } else {
            await bots[code].sendMessage(chat_id, 'Генерирую ссылку на оплату')
            // TODO: hide call to this method within some bot id getter API
            await telegramApi.syncBotsWithDb()
            if (!bots[code].id)
              throw new Error(`Bot ${code} does not present in db`)

            // TODO: get from parameter
            const amount = settings.get('subscription_price')
            if (amount === 0)
              throw new Error('Не определена стоимость подписки')
            const payment = await models.Subscriber.createNewOrder(
              bots[code].id,
              chat_id,
              amount
            )
            const params = {
              pscur: PAYMENT_METHODS.YANDEX_PAYMENT_METHOD,
              amount: amount,
              order_id: payment.id,
              comment: `order ${payment.id} comment`
            }
            const order = await casepay.sci_create_order(params)
            if (order.error) throw new Error(order.message)

            wizard.payment_url = order.url
            this.gotoNextStep(wizard)
            this.handlePayWizardStep(chat_id, code)
          }
        } catch (error) {
          logger.error(error.message)
          this.gotoErrorStep(wizard)
          this.handlePayWizardStep(
            chat_id,
            code,
            'Внутренняя ошибка, пожалуйста, повторите запрос позднее'
          )
        }
        break
      case 3:
        bots[code].sendMessage(
          chat_id,
          'Нажмите на кнопку ниже - вы перейдете на страницу где сможете выбрать способ оплаты',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: 'Оплатить подписку', url: wizard.payment_url }]
              ]
            }
          }
        )
        break
    }
  }

  this.gotoNextStep = wizard => {
    wizard.step++
  }

  this.gotoPrevStep = wizard => {
    wizard.step--
  }

  this.gotoErrorStep = wizard => {
    wizard.step = 0
  }
}

module.exports = wizard

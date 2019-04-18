const constants = require('./constants')
const logger = require('./logger')

let cache, bots

const wizard = function(cache_param, bots_param) {
  cache = cache_param
  bots = bots_param

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

  this.handlePayWizardStep = (chat_id, code, options) => {
    const wizard = this.getPayWizard(chat_id, code)

    switch (wizard.step) {
      case 1:
        bots[code].sendMessage(
          chat_id,
          'Введите правильный e-mail\n' + '(Пример: user@yandex.ru)'
        )
        this.gotoNextStep(wizard)
        console.log(wizard.step, this.getPayWizard(chat_id, code).step)
        break
      case 2:
        if (!options) break

        if (options.search(/\w+@\w+\.\w{2,}/) == -1) {
          this.gotoPrevStep(wizard)
          this.handlePayWizardStep(chat_id)
        } else {
          bots[code]
            .sendMessage(chat_id, 'Генерирую ссылку на оплату')
            .then(() => {
              wizard.payment_url = 'https://pay.ment'
              this.gotoNextStep(wizard)
              this.handlePayWizardStep(chat_id, code)
            })
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
    }
  }

  this.gotoNextStep = wizard => {
    wizard.step++
  }

  this.gotoPrevStep = wizard => {
    wizard.step--
  }
}

module.exports = wizard

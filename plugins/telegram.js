// const request = require('request');
const Bot = require('node-telegram-bot-api')
// const consola = require('consola')
const util = require('./util')
const CACHE = require('./cache')
const Wizard = require('./wizard')

const logger = require('./logger')
const settings = require('./config')

const models = require('./db/models')

let sent_message_log_length, wizardApi

const bots = {}

function cropSentMessage(message) {
  return `${message.substr(0, sent_message_log_length)}...`
}

function parseBotCodeToken(codeToken) {
  const codeTokenArr = codeToken.split('^')
  const code = codeTokenArr[0]
  const token = codeTokenArr[1]

  return { code, token }
}

const Telegram = function(settings, logger, set_webhooks = false) {
  // const today_token = settings.get('credentials.telegram_bot.api_token')
  const api_tokens = settings.get('credentials.telegram_bot.api_tokens')
  const message_prepender = settings.get('debug.message_prepender')
  const application_name = settings.get('application_name')
  const is_production_env = settings.isProductionEnv()

  // TODO: module for content
  this.startInstructions = function() {
    return [
      ['https://www.youtube.com/watch?v=olztRgAZmDA&t=6s', {}],

      [
        '🔥 Litvin Stavit\n' +
          'Месячная подписка \n' +
          'После оплаты у тебя будет:\n' +
          '\n' +
          '1⃣ Личный кабинет в телеграм-боте с обучением по ставкам. (Как ставить? Где ставить? Доп. техники. И тд)\n' +
          '2⃣ 130-150 прогнозов в месяц со средней доходностью 280% в месяц. 4-6 ставок в день с проходимостью 85% \n' +
          '3⃣ Полное сопровождение по всем ставкам + помощь по любым вопросам в течении всего месяца\n' +
          '4⃣ Дополнительный бонус от Litvin Stavit после оплаты\n' +
          '\n' +
          '✅ В среднем вложенные деньги отбиваются за 3 дня\n' +
          '\n' +
          '💳 Стоимость: 3500 рублей\n' +
          '⬇️Если готов начать, Жми',
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: 'Оплатить подписку', callback_data: 'pay_subscription' }
              ],
              [{ text: 'Переход на сайт', url: 'https://ya.ru' }]
            ]
          }
        }
      ],
      [
        '!!!',
        {
          reply_markup: {
            keyboard: [['ОПЛАТИТЬ ПОДПИСКУ'], ['ОСТАЛИСЬ ВОПРОСЫ']],
            resize_keyboard: true
          }
        }
      ]
    ]
  }

  // this.initialInstructionsHandler = async function(msg, match) {
  //   const chatId = msg.chat.id;
  //   parent = this;
  //   await util.asyncForEach(startInstructions(), async (i, instruction) => {
  //     await bot_today.sendMessage(chatId, instruction[0], instruction[1]);
  //     await util.sleep(parent.getDelayBetweenRequests());
  //   })
  // };

  this.setCommands = function(bot) {
    const parent = this

    bot.onText(/\/start|\/info/, async (msg, match) => {
      const chatId = msg.chat.id

      await util.asyncForEach(
        this.startInstructions(),
        async (i, instruction) => {
          await bot.sendMessage(chatId, instruction[0], instruction[1])
          await util.sleep(parent.getDelayBetweenRequests())
        }
      )
    })

    // bot_today.onText(/\/start|\/info/, this.initialInstructionsHandler);
    bot.onText(/ОПЛАТИТЬ ПОДПИСКУ/, (msg, match) => {
      const chatId = msg.chat.id

      wizardApi.startPayWizard(chatId, bot.code)
      wizardApi.handlePayWizardStep(chatId, bot.code)
    })

    bot.onText(/ОСТАЛИСЬ ВОПРОСЫ/, (msg, match) => {
      const chatId = msg.chat.id

      wizardApi.stopPayWizard(chatId, bot.token)

      bot.sendMessage(
        chatId,
        '⬇️ Нажмите на интересующий вопрос, и вы тут же получите ответ',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Соцсети проекта', callback_data: 'social_pages' }],
              [{ text: 'Бесплатный канал', callback_data: 'free_channel' }],
              [{ text: 'Сайт проекта', callback_data: 'web_page' }],
              [
                {
                  text: 'Пользовательское соглашение',
                  callback_data: 'user_terms'
                }
              ],
              [
                {
                  text: 'Проблема с оплатой',
                  callback_data: 'payment_problems'
                }
              ],
              [{ text: 'Задать свой вопрос', callback_data: 'other_question' }]
            ]
          }
        }
      )
    })

    bot.on('message', msg => {
      logger.debug(`incoming message: ${msg.text}`)

      const chat_id = msg.chat.id
      if (msg.text.search(/\/info|\/start/) >= 0) return

      if (msg.text.search(/ОПЛАТИТЬ ПОДПИСКУ|ОСТАЛИСЬ ВОПРОСЫ/) >= 0) return

      if (wizardApi.payWizardStarted(chat_id, bot.code)) {
        const wizard = wizardApi.getPayWizard(chat_id, bot.code)
        wizardApi.handlePayWizardStep(chat_id, bot.code, msg.text)
      } else {
        bot.sendMessage(
          msg.chat.id,
          '⚙️Если у вас возникли трудности с оплатой, обратитесь в нашу тех-поддержку @ruha_stavit_manager и мы вам поможем'
        )
      }
    })

    bot.on('callback_query', msg => {
      // console.log('callback message', msg);
      const chat_id = msg.message.chat.id

      if (msg.data === 'pay_subscription') {
        wizardApi.startPayWizard(chat_id, bot.code)
        wizardApi.handlePayWizardStep(chat_id, bot.code)
      }
    })

    bot.on('polling_error', error => {
      console.log(error) // => 'EFATAL'
    })
  }

  // console.log(Object.getOwnPropertyNames(bots))

  this.parseBotCodeToken = parseBotCodeToken

  this.mapGetUpdatesElement = function(elem) {
    logger.debug('mapGetUpdatesElement', elem)
    return elem.message.chat.id
  }

  this.processUpdate = function(message, code) {
    bots[code].processUpdate(message)
  }

  // TODO
  this.getChatIds = function() {
    return settings
      .get('credentials.telegram_bot.chat_ids')
      .map(chat_id => chat_id.toString().trim())
  }

  this.sendMessageToSubscriber = function(
    chat_id,
    text,
    reply_markup_options,
    code
  ) {
    const sanitized_chat_id = parseInt(chat_id, 10)
    if (isNaN(sanitized_chat_id)) {
      logger.error('chat_id is empty')
      return new Promise((resolve, reject) => {})
    }

    let sanitizedText
    if (message_prepender) {
      sanitizedText = `${message_prepender}\n${text}`.trim()
    } else {
      sanitizedText = text.trim()
    }
    logger.info(
      `sendMessageToSubscriber. chat_id: ${sanitized_chat_id}, text: ${sanitizedText}, code: ${code}`
    )

    return bots[code]
      .sendMessage(sanitized_chat_id, sanitizedText, reply_markup_options)
      .then(message => {
        logger.warn(
          `sendMessageToSubscriber. SEND! chat_id: ${sanitized_chat_id}, text: ${cropSentMessage(
            sanitizedText
          )}`
        )
        logger.debug(message)
        return message
      })
  }

  // HINT: not async function
  this.sendToTelegram = function(
    text,
    reply_markup_options,
    botCode,
    whereClause = {}
  ) {
    const parent = this
    const processor = async function(subscriber) {
      await parent.sendMessageToSubscriber(
        subscriber.chatId,
        text,
        reply_markup_options,
        botCode
      )
      await util.sleep(parent.getDelayBetweenRequests())
    }

    this.processSubscribersInBatches(botCode, processor, whereClause)
  }

  // this.getApiToken = function(settings) {
  //   return settings.get('credentials.telegram_bot.today.api_token')
  // }

  this.getDelayBetweenRequests = function() {
    return settings.get('credentials.telegram_bot.delay_between_requests')
  }

  this.getReplyMarkupBotApiOptions = function(orderNumber) {
    return {
      reply_markup: this.getReplyMarkup(orderNumber)
    }
  }

  this.getEmptyReplyMarkupBotOptions = function() {
    return {}
  }

  this.getReplyMarkup = function(orderNumber) {
    return {
      inline_keyboard: [
        [{ text: 'Забрать заказ', callback_data: `seizeOrder_${orderNumber}` }]
      ]
    }
  }

  this.processSubscribersInBatches = async function(
    botCode,
    subscriberProcessor,
    whereClause = {},
    batchSize = 100
  ) {
    const bot = await models.Bot.findOne({ where: { code: botCode } })
    // HINT: aware of parameter mutation
    whereClause.bot_id = bot.id
    // console.log(bot.id, bot.code)
    // bot.subscribers.forEach((subscriber) => console.log(subscriber.email))
    for await (const subscribers of models.Subscriber.batch({
      where: whereClause,
      batchSize: batchSize
    })) {
      for (const subscriber of subscribers) {
        await subscriberProcessor(subscriber)
      }
    }
  }

  this.initializeBots = function() {
    api_tokens.forEach(codeToken => {
      const { code, token } = parseBotCodeToken(codeToken)

      // TODO: replace with global context variable
      if (is_production_env) {
        bots[code] = new Bot(token)
      } else {
        bots[code] = new Bot(token, { polling: true })
      }

      bots[code].token = token
      bots[code].code = code
      console.log('bot initialized', code, token)
    })

    wizardApi = new Wizard(CACHE, bots, this)
    sent_message_log_length = settings.get('debug.sent_message_log_length')

    if (application_name && set_webhooks) {
      if (is_production_env) {
        // TODO: move webhooks initialization to explicit routine to be run consequently
        // before login
        api_tokens.forEach(codeToken => {
          const { code, token } = parseBotCodeToken(codeToken)

          logger.warn(`Setting bot webhook, code: ${code}`)
          const bot = bots[code]
          bot
            .setWebHook(`https://${application_name}.herokuapp.com/${token}`)
            .then(() => logger.warn('Setting bot webhook - DONE'))
            .then(() => logger.warn('Telegram webhooks initialization passed'))
            .then(() => this.setCommands(bot))
            .catch(error => logger.error(error.message))
        })
      } else {
        api_tokens.forEach(codeToken => {
          const { code } = parseBotCodeToken(codeToken)
          const bot = bots[code]
          this.setCommands(bot)
        })
      }
    }
    if (!application_name)
      logger.error('Параметр application_name не установлен')
  }

  this.syncBotsWithDb = function() {
    const botCodes = Object.getOwnPropertyNames(bots)

    return util.asyncForEach(botCodes, async (i, code) => {
      const bot = bots[code]
      logger.debug(`syncBotsWithDb. id was: ${bot.id}`)
      if (bot.id) return

      const dbBot = await models.Bot.findOne({ where: { code: code } })
      if (bot) {
        bot.id = dbBot.id
        logger.info(
          `syncBotsWithDb. Bot with code '${code}' found in database!`
        )
      } else {
        logger.error(
          `syncBotsWithDb. Bot with code '${code}' NOT found in database!`
        )
      }
    })
  }

  this.initializeBots()
}

// async function init() {
//   const telegram = new Telegram(settings, logger, true)
//   telegram.initializeBots()
//   return telegram
// }

module.exports = new Telegram(settings, logger, true)

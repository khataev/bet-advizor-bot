<template>
  <b-container>
    <b-row>
      <b-col>
        <h1>Панель управления</h1>
      </b-col>
    </b-row>
    <hr />
    <b-row>
      <b-col cols="1" />
      <b-col>
        <!-- Бот -->
        <b-row>
          <b-col>
            <select id="botSelect" v-model="selectedBotId" class="form-control">
              <option disabled :value="extraBotValue">Выберите бота</option>
              <!-- TODO: use component -->
              <option
                v-for="option in botOptions"
                :key="option.id"
                :value="option.id"
                >{{ option.name }}
              </option>
            </select>
          </b-col>
        </b-row>
        <br />
        <!-- Область рассылки -->
        <b-row>
          <b-col>
            <b-form-group>
              <span>Текст рассылки</span>
              <b-form-textarea
                id="message"
                v-model="messageText"
                placeholder="Введите текст рассылки..."
                rows="6"
                max-rows="12"
              ></b-form-textarea>
            </b-form-group>
            <span class="sendMessageResult">{{ sendMessageResult }}</span>
            <div class="float-right">
              <b-button
                variant="outline-primary"
                :disabled="sendMessageDisabled"
                @click="sendMessage"
                >Разослать</b-button
              >
            </div>
          </b-col>
        </b-row>
        <!-- Подписки -->
        <b-row>
          <b-col>
            <h4>Подписчики бота</h4>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <BotSubscribers :bot-id="selectedBotId" :per-page="perPage" />
          </b-col>
        </b-row>
        <!-- Область для показа ошибки -->
        <b-row>
          <span class="errorText">{{ formError }}</span>
        </b-row>

        <!--</div>-->
      </b-col>
      <b-col cols="1" />
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios'

import BotSubscribers from '~/components/BotSubscribers.vue'
import { VUE_DROPDOWN_EXTRA_ITEM_VALUE } from './../plugins/constants'

export default {
  components: {
    BotSubscribers
  },
  // middleware: 'authenticated',
  data() {
    return {
      extraBotValue: VUE_DROPDOWN_EXTRA_ITEM_VALUE,
      selectedBotId: VUE_DROPDOWN_EXTRA_ITEM_VALUE,
      botOptions: [],
      subscribers: [],
      currentPage: 1,
      perPage: 10,
      totalItems: 0,
      messageText: '',
      sendMessageResult: '',
      formError: null,
      showOnlyActiveSubscriptions: true
    }
  },
  computed: {
    sendMessageDisabled: function() {
      return (
        this.selectedBotId === VUE_DROPDOWN_EXTRA_ITEM_VALUE ||
        this.messageText === ''
      )
    }
  },
  beforeMount() {
    this.fetchBots()
  },
  methods: {
    fetchBots: function() {
      axios
        .get('/api/bots')
        .then(response => (this.botOptions = response.data))
        .catch(error => {
          this.formError = error.message
        })
    },
    sendMessage: function() {
      this.sendMessageResult = ''
      axios
        .post('/api/send_message', {
          botCode: this.getBotCode(this.selectedBotId),
          onlyActive: true,
          messageText: this.messageText
        })
        .then(response => (this.sendMessageResult = response.data.message))
        .then(() => setTimeout(() => (this.sendMessageResult = ''), 2000))
        .catch(error => {
          this.formError = error.message
        })
    },
    getBotCode: function(botId) {
      // TODO: === ?
      const bot = this.botOptions.find(element => element.id == botId)
      return bot.code
    }
  }
}
</script>

<style scoped>
.errorText {
  color: red;
}
.sendMessageResult {
  color: blue;
}
</style>

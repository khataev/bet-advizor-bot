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
            <select
              id="botSelect"
              v-model="selectedBotId"
              class="form-control"
              @change="onchange()"
            >
              <option disabled value="choose_value">Выберите бота</option>
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
              <b-button variant="outline-primary" @click="sendMessage"
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
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Telegram ID</th>
                  <th>E-mail ?</th>
                  <th>Состояние подписки</th>
                  <th>Дата активации</th>
                  <th>Действительна до</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in subscribers"
                  :key="item.chatId"
                  :value="item.chatId"
                >
                  <td>{{ item.chatId }}</td>
                  <td>{{ item.email }}</td>
                  <td>
                    {{ item.activeSubscription ? 'Активна' : 'Неактивна' }}
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
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

export default {
  // TODO: return
  // middleware: 'authenticated',
  data() {
    return {
      selectedBotId: 'choose_value',
      botOptions: [],
      subscribers: [],
      messageText: '',
      sendMessageResult: '',
      formError: null
    }
  },
  beforeMount() {
    this.fetchBots()
    // this.fetchSubscribers()
  },
  methods: {
    onchange: function() {
      this.fetchSubscribers(this.selectedBotId)
    },
    fetchBots: function() {
      axios
        .get('/api/bots')
        .then(response => (this.botOptions = response.data))
        .catch(error => {
          this.formError = error.message
        })
    },
    fetchSubscribers: function(botId) {
      axios
        .get(`/api/bots/${botId}/subscribers`)
        .then(response => (this.subscribers = response.data))
        .catch(error => {
          this.formError = error.message
        })
    },
    sendMessage: function() {
      this.sendMessageResult = ''
      axios
        .post('/api/send_message', {
          botCode: this.getBotCode(this.selectedBotId),
          messageText: this.messageText
        })
        .then(response => (this.sendMessageResult = response.data.message))
        .then(() => setTimeout(() => (this.sendMessageResult = ''), 2000))
        .catch(error => {
          this.formError = error.message
        })
    },
    getBotCode: function(botId) {
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

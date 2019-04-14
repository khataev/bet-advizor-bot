<template>
  <div class="container">
    <h1>Dashboard</h1>
    <div class="row">
      <div class="col-1" />
      <div class="col-10">
        <div class="row">
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
              >{{ option.name }}</option
            >
          </select>
          <!--<br />-->
          <!--<span>Selected: {{ key }}</span>-->
        </div>
        <br />
        <div class="row">
          <h2>Подписки</h2>
        </div>
        <div class="row">
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
                <td>{{ item.activeSubscription }}</td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="row">
          <span class="errorText">{{ formError }}</span>
        </div>
        <!--<div class="row">-->
        <b-form-group class="row">
          <span>Текст рассылки</span>
          <b-form-textarea
            id="message"
            v-model="messageText"
            placeholder="Введите текст рассылки..."
            rows="6"
            max-rows="12"
          ></b-form-textarea>
        </b-form-group>
        <div class="row">
          <span class="sendMessageResult">{{ sendMessageResult }}</span>
        </div>
        <div class="float-right">
          <b-button variant="outline-primary" @click="sendMessage"
            >Разослать</b-button
          >
        </div>

        <!--</div>-->
      </div>
      <div class="col-1" />
    </div>
  </div>
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

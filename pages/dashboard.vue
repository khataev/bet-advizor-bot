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
            <b-form>
              <b-form-group label="Текст рассылки" label-for="message">
                <!--<span>Текст рассылки</span>-->
                <b-form-textarea
                  id="message"
                  v-model="messageText"
                  placeholder="Введите текст рассылки..."
                  rows="6"
                  max-rows="12"
                  class="regular-input"
                ></b-form-textarea>

                <emoji-picker :search="search" @emoji="append">
                  <div
                    slot="emoji-invoker"
                    slot-scope="{ events: { click: clickEvent } }"
                    class="emoji-invoker"
                    @click.stop="clickEvent"
                  >
                    <svg
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path
                        d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
                      />
                    </svg>
                  </div>
                  <div
                    slot="emoji-picker"
                    slot-scope="{ emojis, insert, display }"
                  >
                    <div
                      class="emoji-picker"
                    >
                      <!--:style="{ top: display.y + 'px', left: display.x + 'px' }"-->
                      <div class="emoji-picker__search">
                        <input v-model="search" v-focus type="text" />
                      </div>
                      <div>
                        <div
                          v-for="(emojiGroup, category) in emojis"
                          :key="category"
                        >
                          <h5>{{ category }}</h5>
                          <div class="emojis">
                            <span
                              v-for="(emoji, emojiName) in emojiGroup"
                              :key="emojiName"
                              :title="emojiName"
                              @click="insert(emoji)"
                              >{{ emoji }}</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </emoji-picker>
              </b-form-group>
            </b-form>
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
            <BotSubscribers
              :bot-id="selectedBotId"
              :per-page="perPage"
              @filter-params-updated="onFilterParamsUpdated"
            />
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
// import { Picker }from 'emoji-mart-vue'
import EmojiPicker from 'vue-emoji-picker'
import { VUE_DROPDOWN_EXTRA_ITEM_VALUE } from './../plugins/constants'

export default {
  components: {
    BotSubscribers,
    EmojiPicker
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus()
      }
    }
  },
  // middleware: 'authenticated',
  data() {
    return {
      extraBotValue: VUE_DROPDOWN_EXTRA_ITEM_VALUE,
      selectedBotId: VUE_DROPDOWN_EXTRA_ITEM_VALUE,
      botOptions: [],
      perPage: 10,
      messageText: '',
      sendMessageResult: '',
      formError: null,
      filterParams: {},
      input: '',
      search: ''
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
    append(emoji) {
      this.messageText += emoji
    },
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
          showOnlyActive: this.filterParams.showOnlyActiveSubscriptions,
          telegramId: this.filterParams.telegramId,
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
      const bot = this.botOptions.find(element => element.id === botId)
      return bot.code
    },
    onFilterParamsUpdated: function(value) {
      this.filterParams = value
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

.wrapper {
  position: relative;
  display: inline-block;
}

.regular-input {
  padding: 0.5rem 1rem;
  border-radius: 3px;
  border: 1px solid #ccc;
}

.emoji-invoker {
  display: none; /* temporarily turned off */
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}
.emoji-invoker:hover {
  transform: scale(1.1);
}
.emoji-invoker > svg {
  fill: #b1c6d0;
}

.emoji-picker {
  position: absolute;
  z-index: 1;
  font-family: Montserrat;
  border: 1px solid #ccc;
  width: 15rem;
  height: 20rem;
  overflow: scroll;
  padding: 1rem;
  box-sizing: border-box;
  border-radius: 0.5rem;
  background: #fff;
  box-shadow: 1px 1px 8px #c7dbe6;
}
.emoji-picker__search {
  display: flex;
}
.emoji-picker__search > input {
  flex: 1;
  border-radius: 10rem;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  outline: none;
}
.emoji-picker h5 {
  margin-bottom: 0;
  color: #b1b1b1;
  text-transform: uppercase;
  font-size: 0.8rem;
  cursor: default;
}
.emoji-picker .emojis {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.emoji-picker .emojis:after {
  content: '';
  flex: auto;
}
.emoji-picker .emojis span {
  padding: 0.2rem;
  cursor: pointer;
  border-radius: 5px;
}
.emoji-picker .emojis span:hover {
  background: #ececec;
  cursor: pointer;
}
</style>

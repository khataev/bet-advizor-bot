<template>
  <div>
    <b-table
      bordered
      striped
      hover
      small
      responsive
      :current-page="innerCurrentPage"
      :per-page="0"
      :items="innerSubscribers"
      :fields="fields"
    >
      <template slot="thead-top" slot-scope="data">
        <tr>
          <th>
            <b-form-input
              v-model="innerTelegramId"
              type="number"
              placeholder="Введите искомый ID ..."
              @keyup.enter="submitSearch"
            ></b-form-input>
          </th>
          <th class="align-middle">
            <b-form-checkbox
              id="onlyActiveSubscriptions"
              v-model="innerShowOnlyActiveSubscriptions"
              name="checkbox-1"
              value="true"
              unchecked-value="false"
              >Только активные
            </b-form-checkbox>
          </th>
          <th></th>
          <th></th>
        </tr>
      </template>
      <!-- A custom formatted column -->
      <template slot="subscriptionStatus" slot-scope="data">
        {{ data.item.activeSubscription ? 'Активна' : 'Неактивна' }}
      </template>
    </b-table>
    <b-pagination
      v-model="innerCurrentPage"
      size="md"
      :total-rows="innerTotalItems"
      :per-page="perPage"
    ></b-pagination>
  </div>
</template>

<script>
import axios from 'axios'
import { VUE_DROPDOWN_EXTRA_ITEM_VALUE } from './../plugins/constants'

export default {
  props: {
    botId: {
      type: Number
    },
    perPage: {
      type: Number,
      default() {
        return 10
      }
    }
  },
  data() {
    return {
      fields: {
        chatId: {
          label: 'Telegram ID',
          sortable: true
        },
        // email: {
        //   label: 'Email',
        //   sortable: false
        // },
        subscriptionStatus: {
          label: 'Состояние подписки',
          sortable: false
        },
        activationDate: {
          label: 'Дата активации',
          sortable: false
        },
        deactivationDate: {
          label: 'Действительна до',
          sortable: false
        }
      },
      innerBotId: this.botId,
      innerSubscribers: [],
      innerTotalItems: 0,
      innerCurrentPage: 1,
      innerTelegramId: undefined,
      innerShowOnlyActiveSubscriptions: this.showOnlyActiveSubscriptions
    }
  },
  watch: {
    botId: {
      handler: function(value) {
        this.fetchSubscribers(
          value,
          this.innerShowOnlyActiveSubscriptions,
          this.innerCurrentPage,
          this.perPage
        )
      }
    },
    innerCurrentPage: {
      handler: function(value) {
        this.fetchSubscribers(
          this.botId,
          this.innerShowOnlyActiveSubscriptions,
          value,
          this.perPage
        )
      }
    },
    innerShowOnlyActiveSubscriptions: {
      handler: function(value) {
        this.$emit('filter-params-updated', this.getFilterParams())
        this.innerCurrentPage = 1

        this.fetchSubscribers(
          this.botId,
          value,
          this.innerCurrentPage,
          this.perPage,
          this.innerTelegramId
        )
      }
    }
  },
  beforeMount() {
    this.fetchSubscribers(
      this.botId,
      this.innerShowOnlyActiveSubscriptions,
      this.innerCurrentPage,
      this.perPage
    )
  },
  methods: {
    getFilterParams: function() {
      return {
        showOnlyActiveSubscriptions: this.innerShowOnlyActiveSubscriptions,
        telegramId: this.innerTelegramId
      }
    },
    submitSearch: function() {
      this.$emit('filter-params-updated', this.getFilterParams())
      // TODO: how to avoid double fetch?
      this.innerCurrentPage = 1

      this.fetchSubscribers(
        this.botId,
        this.innerShowOnlyActiveSubscriptions,
        this.innerCurrentPage,
        this.perPage,
        this.innerTelegramId
      )
    },
    // TODO: params as a one hash rather than several separate parameters
    fetchSubscribers: function(
      botId,
      showOnlyActive,
      page = 1,
      limit = 10,
      telegramId = undefined
    ) {
      if (botId === VUE_DROPDOWN_EXTRA_ITEM_VALUE) return

      axios
        .get(`/api/bots/${botId}/subscribers`, {
          params: {
            page: page,
            limit: limit,
            showOnlyActive: showOnlyActive,
            telegramId: telegramId
          }
        })
        .then(response => {
          // TODO: totalItems and subscribers should be fetched separately
          this.innerTotalItems = parseInt(response.headers['x-total-count'], 10)
          this.innerSubscribers = response.data
        })
        .catch(error => {
          this.formError = error.message
        })
    }
  }
}
</script>

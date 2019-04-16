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
      :items="items"
      :fields="fields"
    >
      <!-- A custom formatted column -->
      <template slot="subscriptionStatus" slot-scope="data">
        {{ data.item.activeSubscription ? 'Активна' : 'Неактивна' }}
      </template>
    </b-table>
    <b-pagination
      v-model="innerCurrentPage"
      size="md"
      :total-rows="totalItems"
      :per-page="perPage"
    ></b-pagination>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default() {
        return []
      }
    },
    currentPage: {
      type: Number,
      default() {
        return 1
      }
    },
    perPage: {
      type: Number,
      default() {
        return 10
      }
    },
    totalItems: {
      type: Number,
      default() {
        return 0
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
        email: {
          label: 'Email',
          sortable: false
        },
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
      innerCurrentPage: this.currentPage
    }
  },
  watch: {
    innerCurrentPage: {
      handler: function(value) {
        this.$emit('current-page-updated', value)
      }
    }
  }
}
</script>

<template>
  <div>
    <b-table bordered striped hover :items="items" :fields="fields">
      <!-- A custom formatted column -->
      <template slot="subscriptionStatus" slot-scope="data">
        {{ data.item.activeSubscription ? 'Активна' : 'Неактивна' }}
      </template>
    </b-table>
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
      }
    }
  }
}
</script>

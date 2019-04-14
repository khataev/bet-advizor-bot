<template>
  <div>
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
        <tr v-for="item in items" :key="item.chatId" :value="item.chatId">
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
  }
}
</script>

<template>
  <div class="container">
    <h1>Dashboard</h1>
    <div class="row">
      <div class="col-1" />
      <div class="col-10">
        <div class="row">
          <select
            id="botSelect"
            v-model="key"
            class="form-control"
            @change="onchange()"
          >
            <option disabled value="">Выберите бота</option>
            <option>Ruha ставит</option>
            <option selected>Мяч продакшн</option>
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
          </table>
        </div>
      </div>
      <div class="col-1" />
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'authenticated',
  data() {
    return {
      key: ''
    }
  },
  methods: {
    onchange: function() {
      console.log(this.key)
    }
  }
}
</script>

<style scoped></style>

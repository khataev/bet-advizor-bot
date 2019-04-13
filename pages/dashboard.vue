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
            <!-- TODO: use component -->
            <option
              v-for="option in botOptions"
              :key="option.value"
              :value="option.value"
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
          </table>
        </div>
        <div class="row">
          <span class="errorText">{{ formError }}</span>
        </div>
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
      key: '',
      botOptions: [],
      formError: null
    }
  },
  beforeMount() {
    this.fetchBots()
  },
  methods: {
    onchange: function() {
      console.log(this.key)
    },
    fetchBots: function() {
      axios
        .get('/api/bots')
        .then(response => (this.botOptions = response.data))
        .catch(error => {
          console.log(error.message)
          this.formError = error.message
        })
    }
  }
}
</script>

<style scoped>
.errorText {
  color: red;
}
</style>

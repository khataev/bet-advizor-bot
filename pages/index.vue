<template>
  <section class="container">
    <div>
      <!--<logo />-->
      <!--<h1 class="title">-->
        <!--bet-advizor-bot-->
      <!--</h1>-->
      <!--<h2 class="subtitle">-->
        <!--Bet Advizor Bot System1-->
      <!--</h2>-->
      <div class="row">
        <div v-if="$store.state.auth">
          <p>
            You are authenticated. You can see the
            <NuxtLink to="/secret"> secret page </NuxtLink>!
          </p>
          <button @click="logout">
            Logout
          </button>
        </div>
        <p v-else>
          Please
          <NuxtLink to="/login"> login </NuxtLink>.
        </p>
      </div>
    </div>
  </section>
</template>

<script>
// import Logo from '~/components/Logo.vue'

const Cookie = process.client ? require('js-cookie') : undefined

export default {
  methods: {
    logout() {
      Cookie.remove('auth')
      this.$store.commit('setAuth', null)
    }
  },
  components: {
    // Logo
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>

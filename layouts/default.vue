<template>
  <div class="wrapper">
    <header class="header">
      <nav class="navbar navbar-static-top">
        <div clas="navbar-custom-menu">
          <ul class="nav navbar-nav>">
            <li v-if="$store.state.authUser">
              <NuxtLink to="/secret">Secret</NuxtLink>
            </li>
            <li v-if="$store.state.authUser">
              <a href="#" @click="logout">Logout</a>
              <!--<NuxtLink to="/logout">Logout</NuxtLink>-->
            </li>
            <li v-else>
              <NuxtLink to="/login">Login</NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <div class="content-wrapper">
      <nuxt />
    </div>
  </div>
</template>

<script>
  // import Logo from '~/components/Logo.vue'

  export default {
    components: {
      // Logo
    },
    methods: {
      // logout() {
      //   debugger
      //   Cookie.remove('auth')
      //   this.$store.commit('setAuth', null)
      // }
      async logout() {
        try {
          await this.$store.dispatch('logout')
          this.$router.push('/login')
        } catch (e) {
          this.formError = e.message
        }
      }
    }
  }
</script>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
  ul.nav>li {
    padding: 10px;
  }
</style>

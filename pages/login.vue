<template>
  <div class="container login-container">
    <div class="row">
      <div class="col-3" />
      <div class="col-6 login-form-1">
        <h3>Login</h3>
        <form>
          <div class="form-group">
            <input
              v-model="formEmail"
              type="email"
              class="form-control"
              placeholder="Your Email *"
              value=""
            />
          </div>
          <div class="form-group">
            <input
              v-model="formPassword"
              type="password"
              class="form-control"
              placeholder="Your Password *"
              value=""
            />
          </div>
          <div class="form-group">
            <input class="btnSubmit" value="Login" @click="login" />
          </div>
          <!--<div class="form-group">-->
          <!--<a href="#" class="ForgetPwd">Forget Password?</a>-->
          <!--</div>-->
        </form>
      </div>
      <div class="col-3" />
    </div>
  </div>
</template>

<script>
// const Cookie = process.client ? require('js-cookie') : undefined

export default {
  middleware: 'notAuthenticated',
  data() {
    return {
      formError: null,
      formEmail: '',
      formPassword: ''
    }
  },
  methods: {
    async login() {
      try {
        await this.$store.dispatch('login', {
          email: this.formEmail,
          password: this.formPassword
        })
        this.formEmail = ''
        this.formPassword = ''
        this.formError = null
        this.$router.push('/')
      } catch (e) {
        this.formError = e.message
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  margin-top: 5%;
  margin-bottom: 5%;
}
.login-form-1 {
  padding: 5%;
  box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 9px 26px 0 rgba(0, 0, 0, 0.19);
}
.login-form-1 h3 {
  text-align: center;
  color: #333;
}
.login-container form {
  padding: 10%;
}
.btnSubmit {
  width: 50%;
  border-radius: 1rem;
  padding: 1.5%;
  border: none;
  cursor: pointer;
}
.login-form-1 .btnSubmit {
  font-weight: 600;
  color: #fff;
  background-color: #0062cc;
}
.login-form-1 .ForgetPwd {
  color: #0062cc;
  font-weight: 600;
  text-decoration: none;
}
</style>

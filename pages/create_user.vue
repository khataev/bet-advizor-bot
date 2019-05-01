<template>
  <div class="container login-container">
    <div class="row">
      <div class="col-3" />
      <div class="col-6 login-form-1">
        <h3>Create User</h3>
        <b-form>
          <b-form-group>
            <b-form-input
              v-model="formEmail"
              type="email"
              class="form-control"
              placeholder="User Email *"
              required
              value=""
            />
          </b-form-group>
          <b-form-group>
            <b-form-input
              v-model="formName"
              type="text"
              class="form-control"
              placeholder="User Name *"
              required
              value=""
            />
          </b-form-group>
          <b-form-group>
            <b-form-input
              v-model="formPassword"
              type="password"
              class="form-control"
              placeholder="User Password *"
              required
              value=""
            />
          </b-form-group>
          <b-form-group>
            <b-form-input
              v-model="formPasswordConfirmation"
              type="password"
              class="form-control"
              placeholder="Confirm Password *"
              required
              value=""
            />
          </b-form-group>
          <b-form-group>
            <b-form-input
              class="btnSubmit"
              value="Create"
              @click="createUser"
            />
          </b-form-group>
          <!--<div class="form-group">-->
          <!--<a href="#" class="ForgetPwd">Forget Password?</a>-->
          <!--</div>-->
        </b-form>
        <span class="formResult">{{ formResult }}</span>
      </div>
      <div class="col-3" />
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  middleware: 'admin',
  data() {
    return {
      formResult: null,
      formEmail: '',
      formName: '',
      formPassword: '',
      formPasswordConfirmation: ''
    }
  },
  methods: {
    createUser() {
      axios
        .post('/api/users', {
          email: this.formEmail,
          name: this.formName,
          password: this.formPassword,
          passwordConfirmation: this.formPasswordConfirmation
        })
        .then(response => {
          this.formResult = response.data.message
          setTimeout(() => (this.formResult = ''), 2000)
        })
        .catch(error => {
          console.log(error)
          this.formResult = error.message
        })
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

.formResult {
  color: blue;
}
</style>

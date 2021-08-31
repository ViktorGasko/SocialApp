<template>
  <div class="container">
    <h1>Dingster</h1>
    <div class="login-form">
      <form @submit.prevent="loginUser">
        <label for="email">Email</label
        ><input type="email" id="email" name="email" v-model="email" />
        <label for="password">Password</label
        ><input
          type="password"
          id="password"
          name="password"
          v-model="password"
        />
        <input type="submit" value="Log In" />
      </form>
      <button @click="showRegisterForm">Create New Account</button>
    </div>
    <register-form :open="RegisterFormIsShown" @closeForm="closeRegisterForm" />
  </div>
</template>

<script>
import RegisterForm from "../components/RegisterForm.vue";
import { useRouter } from "vue-router";

export default {
  components: {
    RegisterForm,
  },
  data() {
    return {
      router: useRouter(),
      email: "",
      password: "",
      RegisterFormIsShown: false,
    };
  },

  methods: {
    showRegisterForm() {
      this.RegisterFormIsShown = true;
    },
    closeRegisterForm() {
      this.RegisterFormIsShown = false;
    },
    async loginUser() {
      const res = await this.$store.dispatch("login", {
        email: this.email,
        password: this.password,
      });
      if (!res.ok) {
        console.log(res.response);
      } else {
        this.router.push({ path: "/" });
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
.container {
  position: fixed;
  padding: 0;
  margin: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  background: $color1;
}
.login-form {
  background: $color6;
  max-width: 400px;
  height: 450px;
  margin: auto;
  padding: 40px 50px;
}
h1 {
  color: $color2;
  font-size: 3rem;
  margin-bottom: 20px;
}
label {
  display: block;
  text-align: left;
  font-size: 1.3rem;
  color: $color2;
}
input {
  display: block;
  margin: auto;
  padding: 5px 10px;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 20px;
  font-size: 1.2rem;
  border: 2px solid $color6;
  outline: none;
}
input:focus {
  outline: none;
  border: 2px solid $color4;
}
input[type="submit"] {
  margin-top: 30px;
  background: $color4;
  border: none;
  font-weight: bold;
  color: $color6;
}
button:active,
input[type="submit"]:active {
  opacity: 0.9;
}
button:hover,
input[type="submit"]:hover {
  opacity: 0.9;
}
button {
  font-size: 1.2rem;
  padding: 8px 25px;
  margin-top: 100px;
  border: none;
  background: $color4;
  color: $color6;
  font-weight: bold;
}

button:active {
  border: 2px solid $color2;
}
</style>
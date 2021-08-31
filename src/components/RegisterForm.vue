<template>
  <div>
    <div v-if="open" class="background"><h1>Dingster</h1></div>
    <transition>
      <div v-if="open" class="form">
        <h2>Register</h2>
        <button class="close-btn" @click="closeForm">X</button>
        <form @submit.prevent="registerUser">
          <label for="email">Email</label
          ><input
            type="email"
            id="email"
            name="email"
            v-model.trim="email"
            placeholder="your valid email"
          />
          <label for="username">Username</label
          ><input
            type="text"
            id="username"
            name="username"
            v-model.trim="username"
            placeholder="your username (min. 4 char.)"
          />
          <label for="password">Password</label
          ><input
            type="password"
            id="password"
            name="password"
            v-model.trim="password"
            placeholder="your password (min. 6 char.)"
          />
          <label for="password">Confirm Password</label
          ><input
            type="password"
            id="password2"
            name="password2"
            v-model.trim="password2"
          />

          <input type="submit" value="Submit" :disabled="disabledSubmit" />
        </form>
        <p class="radio-label">
          By submiting you agree to the
          <button class="terms-btn" @click="showTerms">
            terms and conditions</button
          >.
        </p>
      </div>
    </transition>
    <terms-conditions v-if="termsVisible" @closeTerms="showTerms" />
  </div>
</template>

<script>
import TermsConditions from "./TermsConditions.vue";
import { useRouter } from "vue-router";
import { mapActions } from "vuex";

export default {
  props: ["open"],
  components: {
    TermsConditions,
  },
  data() {
    return {
      router: useRouter(),
      email: "",
      username: "",
      password: "",
      password2: "",
      termsVisible: false,
    };
  },
  computed: {
    disabledSubmit() {
      return !(
        this.password.length >= 6 &&
        this.password === this.password2 &&
        this.email.includes("@") &&
        this.username.length > 3
      );
    },
  },
  methods: {
    ...mapActions(["signup"]),
    closeForm() {
      this.email = "";
      this.username = "";
      this.password = "";
      this.password2 = "";
      this.$emit("closeForm");
    },
    showTerms() {
      this.termsVisible = !this.termsVisible;
    },
    async registerUser() {
      const res = await this.$store.dispatch("signup", {
        email: this.email,
        password: this.password,
        displayName: this.username,
      });
      if (!res.ok) {
        console.log(res.response);
      } else {
        this.$router.push({ path: "/" });
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
.background {
  position: fixed;
  padding: 0;
  margin: 0;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  background: black;
  z-index: 10;
  h1 {
    color: white;
    font-size: 3rem;
    margin-bottom: 20px;
  }
}
.form {
  background-color: $color6;
  position: relative;
  width: 400px;
  height: 500px;
  padding: 0 50px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.25);
  z-index: 12;
  margin: auto;
  margin-top: -450px;
}
h2 {
  color: white;
  display: inline-block;
}
button.close-btn {
  position: absolute;
  right: 0;
  margin: 10px;
  padding: 4px 8px;
  font-weight: bold;
  font-size: 1.2rem;
  background: $color4;
  border: none;
  color: $color6;
}
button.close-btn:active {
  opacity: 0.9;
}
input {
  display: block;
  margin: auto;
  padding: 5px 10px;
  width: 100%;
  margin-top: 5px;
  margin-bottom: 10px;
  font-size: 1.2rem;
  border: 2px solid $color6;
  outline: none;
}
label {
  display: block;
  text-align: left;
  font-size: 1.3rem;
  color: $color2;
}
input:focus {
  outline: none;
  border: 2px solid $color4;
}
input[type="submit"] {
  margin-top: 30px;
  background: $color4;
  border: none;
  color: $color6;
  font-weight: bold;
}
input[type="submit"]:active {
  background: $color4;
  color: white;
}
button.terms-btn {
  font-size: 1rem;
  background: none;
  border: none;
  color: $color4;
  font-weight: bold;
  margin-right: -5px;
}
p {
  display: inline-block;
  text-align: center;
  margin-top: 7px;
}
input:disabled {
  background: $color6;
  color: white;
  filter: brightness(1.25);
  cursor: default;
}
::placeholder {
  color: #ccc;
}
.v-enter-from {
  opacity: 0;
  transform: translateY(-80px);
}
.v-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.v-enter-active {
  transition: all 0.3s ease-out;
}
</style>
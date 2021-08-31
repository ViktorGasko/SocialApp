<template>
  <nav-bar-logged-in :user="user" />
</template>

<script>
import NavBarLoggedIn from "./NavBarLoggedIn.vue";

export default {
  components: { NavBarLoggedIn },
  props: ["user"],
  data() {
    return {};
  },
  methods: {
    logout() {
      this.$store.dispatch("logout");
      this.$router.push({ name: "Login" });
    },
    toMainPage() {
      this.$router.push({
        name: "Home",
      });
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
</style>

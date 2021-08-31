<template>
  <div class="content-1">
    <nav-bar v-if="getUser && loginPage" :user="getUser"></nav-bar>
    <router-view></router-view>
  </div>
</template>


<script>
import NavBar from "./components/NavBar.vue";

export default {
  components: {
    NavBar,
  },
  data() {
    return { url: "" };
  },
  computed: {
    getUser() {
      return this.$store.getters.getUser;
    },
    loginPage() {
      return this.url !== "/login";
    },
  },
  watch: {
    $route(to) {
      this.url = to.fullPath;
    },
  },
};
</script>
<style lang='scss'>
@import "./scss/_variables.scss";
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap");

body {
  margin: 0;
  padding: 0;
}
* {
  box-sizing: border-box;
  font-family: "Roboto", sans-serif;
}
input[type="submit"],
button:hover {
  cursor: pointer;
}
button {
  border: none;
}
.container-1 {
  position: relative;
  display: flex;
  justify-content: center;
  background: black;
  min-height: 93vh;
  width: 100%;
}
.main-1 {
  margin: 2vh 0;
  width: 50%;
  background: $color4;
}
.side-1 {
  width: 25%;
  margin: 2vh 0;
}
li {
  list-style: none;
}
ul {
  margin: 0;
  padding: 0;
}

.load-spinner {
  position: relative;
  left: 0;
  right: 0;
  margin: 0 auto;
  border: 13px solid white;
  border-radius: 50%;
  border-top: 13px solid $color6;
  width: 100px;
  height: 100px;
  -webkit-animation: spin 1.2s linear infinite; /* Safari */
  animation: spin 1.2s linear infinite;
  /* Safari */
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>


<template>
  <div class="header">
    <button class="btn btn-home" @click="toMainPage">
      <p>
        <font-awesome-icon icon="home" />
      </p>
    </button>
    <div class="search">
      <input
        type="text"
        class="searchbar"
        placeholder="Search"
        v-on:keydown.enter.exact.prevent="search"
        v-model.trim="searchTerm"
      />
      <ul v-if="resultsUser || resultsGroup">
        <li
          v-for="result in resultsUser"
          :key="result.id"
          @click="showProfile(result.id, 'user')"
        >
          <div class="img">
            <img :src="result.photoUrl" alt="" />
          </div>
          {{ result.displayName }}
        </li>
        <li
          v-for="result in resultsGroup"
          :key="result.id"
          @click="showProfile(result.id, 'group')"
        >
          <div class="img">
            <img :src="result.photoUrl" alt="" />
          </div>
          {{ result.name }}
        </li>
        <li v-if="noResults">No Results</li>
      </ul>
    </div>
    <router-link
      class="btn btn-profile"
      :to="{
        name: 'Profile',
        params: { id: user.uid },
      }"
    >
      <p>
        <font-awesome-icon icon="user" />
        <i>Hello, {{ user.displayName }}</i>
      </p>
    </router-link>

    <button class="btn btn-logout" @click="logout">
      <p>
        <font-awesome-icon icon="user-slash" />
      </p>
    </button>
  </div>
</template>

<script>
import { projectFirestore } from "../firebase/config";
export default {
  props: ["user"],
  data() {
    return {
      searchTerm: "",
      resultsUser: [],
      resultsGroup: [],
      searching: false,
    };
  },
  computed: {
    noResults() {
      return (
        this.searchTerm.length > 0 &&
        this.resultsUser.length === 0 &&
        this.resultsGroup.length === 0 &&
        !this.searching
      );
    },
  },
  methods: {
    showProfile(id, type) {
      let name = "Profile";
      if (type === "group") {
        name = "Group";
      }
      this.resultsUser = [];
      this.resultsGroup = [];
      this.searchTerm = "";
      this.$router.push({ name: name, params: { id: id } });
    },
    logout() {
      this.$store.dispatch("logout");
      this.$router.push({ name: "Login" });
    },
    toMainPage() {
      this.$router.push({
        path: "/",
      });
    },
    search() {
      if (this.searchTerm.length >= 1) {
        this.$router.push({
          name: "Results",
          query: { search: this.searchTerm },
        });
        this.searchTerm = "";
      }
    },
  },
  watch: {
    $route() {
      this.searchTerm = "";
    },
    searchTerm() {
      this.searching = true;
      projectFirestore
        .collection("user")
        .where(
          "searchableIndex",
          "array-contains",
          `${this.searchTerm.toLowerCase()}`
        )
        .limit(5)
        .get()
        .then((res) => {
          this.resultsUser = [];
          res.forEach((doc) => {
            this.resultsUser.push({ ...doc.data(), id: doc.id });
          });
        });
      projectFirestore
        .collection("groups")
        .where(
          "searchableIndex",
          "array-contains",
          `${this.searchTerm.toLowerCase()}`
        )
        .limit(5)
        .get()
        .then((res) => {
          this.resultsGroup = [];
          res.forEach((doc) => {
            this.resultsGroup.push({ ...doc.data(), id: doc.id });
          });
          this.searching = false;
        });
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
.header {
  display: flex;
  width: 100%;
  height: 7vh;
  align-items: center;
  background: $color4;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  .btn {
    height: 100%;
    display: flex;
    align-items: center;
    border: none;
    background: inherit;
    text-decoration: none;
    p {
      font-size: 18px;
      color: $color6;
      i {
        font-style: normal;
      }
    }
    svg {
      font-size: 22px;
      color: $color6;
    }
  }
  .btn:hover {
    background: $color5;
    p,
    svg {
      color: $color2;
    }
  }
  .btn-home,
  .btn-logout {
    svg {
      margin: 0 15px;
    }
  }
  .btn-profile {
    padding: 0 10px;
    svg {
      margin-right: 10px;
    }
  }
  .search {
    position: absolute;
    top: 0;
    left: 75px;
    display: flex;
    flex-direction: column;
    input[type="text"] {
      align-self: center;
      position: relative;
      padding: 0 0.5rem;
      margin-top: 1.5vh;
      height: 4vh;
      width: 300px;
      font-size: 1.1rem;
      border: 1px solid $color4;
    }
    ul {
      li {
        width: 100%;
        background: #555;
        color: white;
        padding: 0.25rem 0.5rem;
        font-weight: bold;
        &:hover {
          background: black;
          cursor: pointer;
        }
        .img {
          margin-right: 0.25rem;
          height: 40px;
          width: 40px;
          display: inline-block;
          vertical-align: middle;
          img {
            width: inherit;
            height: inherit;
            object-fit: cover;
          }
        }
      }
    }
  }
  input[type="text"]:focus {
    outline: 1px solid $color5;
  }
  .btn-profile {
    margin-left: auto;
  }
}
</style>

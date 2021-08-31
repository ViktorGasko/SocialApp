<template>
  <div class="container">
    <div class="header">
      <button
        @click="showResultsFor('user')"
        :class="{ active: showingResultsFor == 'user' }"
      >
        <p>
          <font-awesome-icon icon="user" />
          <i>Users</i>
        </p>
      </button>
      <button
        :class="{ active: showingResultsFor == 'group' }"
        @click="showResultsFor('group')"
      >
        <p><font-awesome-icon icon="users" /><i>Groups</i></p>
      </button>
    </div>
    <div v-if="!searching">
      <div class="results" v-if="showingResultsFor === 'user'">
        <ul v-if="resultsUser.length > 0">
          <li
            v-for="user in resultsUser"
            :key="user.id"
            @click="pushToProfile(user.id, 'user')"
          >
            <div class="img">
              <img :src="user.photoUrl" alt="" />
            </div>
            <h3>{{ user.displayName }}</h3>
          </li>
        </ul>
        <div class="no-results" v-else><h2>No Results Found</h2></div>
      </div>
      <div class="results" v-else>
        <ul v-if="resultsGroup.length > 0">
          <li
            v-for="group in resultsGroup"
            :key="group.id"
            @click="pushToProfile(group.id, 'groups')"
          >
            <div class="img">
              <img :src="group.photoUrl" alt="" />
            </div>
            <h3>{{ group.name }}</h3>
          </li>
        </ul>
        <div class="no-results" v-else><h2>No Results Found</h2></div>
      </div>
    </div>
    <div class="load-spinner" v-else></div>
  </div>
</template>

<script>
import { projectFirestore } from "../firebase/config";
export default {
  data() {
    return {
      showingResultsFor: "user",
      resultsUser: [],
      resultsGroup: [],
      searching: true,
    };
  },
  methods: {
    showResultsFor(e) {
      this.showingResultsFor = e;
    },
    pushToProfile(id, type) {
      let name = "Profile";
      if (type === "groups") {
        name = "Group";
      }
      this.$router.push({ name: name, params: { id: id } });
    },
  },
  created() {
    projectFirestore
      .collection("user")
      .where(
        "searchableIndex",
        "array-contains",
        `${this.$route.query.search.toLowerCase()}`
      )
      .limit(100)
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
        `${this.$route.query.search.toLowerCase()}`
      )
      .limit(100)
      .get()
      .then((res) => {
        this.resultsGroup = [];
        res.forEach((doc) => {
          this.resultsGroup.push({ ...doc.data(), id: doc.id });
        });
        this.searching = false;
      });
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";

.container {
  margin: 20px;
  .header {
    button {
      background: $color6;
      border: none;
      padding: 0 15px;
      &:hover {
        opacity: 0.95;
      }
      &.active {
        opacity: 0.9;
      }
      p {
        margin: 10px 0;
        font-size: 18px;
        color: $color2;
        i {
          font-style: normal;
        }
      }
      svg {
        font-size: 22px;
        margin-right: 10px;
        color: $color2;
      }
    }
  }
  .results {
    border: 2px solid $color6;
    ul {
      li {
        cursor: pointer;
        &:hover {
          background: #efca85;
        }
        h3 {
          padding-left: 1rem;
          display: inline-block;
        }
        .img {
          margin: 10px;
          margin-right: 0.25rem;
          height: 80px;
          width: 80px;
          display: inline-block;
          vertical-align: top;
          img {
            width: inherit;
            height: inherit;
            object-fit: cover;
          }
        }
      }
    }
    .no-results {
      display: block;
      text-align: center;
      padding: 50px 0;
    }
  }
}
</style>
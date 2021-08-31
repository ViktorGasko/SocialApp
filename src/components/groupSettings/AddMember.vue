<template>
  <div class="container">
    <form @submit.prevent="searchUsers">
      <input
        type="text"
        v-model="name"
        placeholder="Username (at least 3 char.)"
      />
      <input type="submit" :disabled="name.length < 3" value="Search" />
    </form>
    <div class="search-results" v-if="search">
      <div class="results-title">
        <h4>Search Results</h4>
        <button @click="closeSearch" class="close-btn">
          <p>
            <font-awesome-icon icon="times" />
          </p>
        </button>
      </div>
      <div class="results">
        <ul v-if="searchResultsDat.length > 0">
          <li v-for="user in searchResultsDat" :key="user.id">
            <div class="picture">
              <img :src="user.photoUrl" alt="" />
            </div>
            <div class="user">
              <router-link
                class="link"
                :to="{
                  name: 'Profile',
                  params: { id: user.id },
                }"
                >{{ user.displayName }}</router-link
              >
              <button @click="sendInvite(user.id)">Send Invite</button>
            </div>
          </li>
        </ul>
        <ul v-else>
          <li class="no-results"><h4>No Results Found</h4></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { projectFirestore } from "../../firebase/config";
export default {
  props: ["id"],
  data() {
    return {
      name: "",
      searchResults: [],
      search: false,
      searchResultsDat: [],
    };
  },
  methods: {
    sendInvite(id) {
      projectFirestore
        .collection("userPublic")
        .doc(id)
        .collection("groupInvites")
        .doc(this.$props.id)
        .set({ value: "Pending" });
    },
    closeSearch() {
      this.name = "";
      this.searchResults = [];
      this.searchResultsDat = [];
      this.search = false;
    },
    async searchUsers() {
      await projectFirestore
        .collection("searchUsers")
        .get()
        .then(async (res) => {
          for (let i = 0; i < res.docs.length; i++) {
            let sim = this.similarity(res.docs[i].id, this.name);
            if (sim > 0.92) {
              this.searchResults.unshift(res.docs[i].data());
            } else if (sim > 0.82) {
              this.searchResults.push(res.docs[i].data());
            }
          }
          for (let i = 0; i < this.searchResults.length; i++) {
            for (let j = 0; j < this.searchResults[i].users.length; j++) {
              await projectFirestore
                .collection("userPublic")
                .doc(this.searchResults[i].users[j])
                .get()
                .then((res) => {
                  this.searchResultsDat.push({
                    ...res.data(),
                    id: this.searchResults[i].users[j],
                  });
                });
            }
          }
          this.search = true;
        });
    },
    similarity(s1, s2) {
      let longer = s1;
      let shorter = s2;
      if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
      }
      const longerLength = longer.length;
      if (longerLength == 0) {
        return 1.0;
      }
      return (
        (longerLength - this.editDistance(longer, shorter)) /
        parseFloat(longerLength)
      );
    },
    editDistance(s1, s2) {
      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();

      const costs = new Array();
      for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
          if (i == 0) costs[j] = j;
          else {
            if (j > 0) {
              let newValue = costs[j - 1];
              if (s1.charAt(i - 1) != s2.charAt(j - 1))
                newValue =
                  Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
              costs[j - 1] = lastValue;
              lastValue = newValue;
            }
          }
        }
        if (i > 0) costs[s2.length] = lastValue;
      }
      return costs[s2.length];
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../../scss/_variables.scss";
input[type="text"] {
  font-size: 1rem;
  border: none;
  padding: 0.2rem;
  border: 2px solid white;
  width: 40%;
  min-width: 300px;
}
input[type="text"]:focus {
  outline: none;
  border: 2px solid $color6;
}
input[type="submit"] {
  font-size: 1.2rem;
  border: none;
  padding: 0.25rem 0.75rem;
  margin-top: 1rem;
  display: block;
  color: white;
  background: $color6;
  &:disabled {
    cursor: not-allowed;
  }
}
form {
  input[type="text"] {
    font-size: 1rem;
    border: none;
    padding: 0.25rem;
    border: 2px solid white;
    width: 40%;
    min-width: 300px;
  }
  input[type="text"]:focus {
    outline: none;
    border: 0.1rem solid $color6;
  }
  input[type="submit"] {
    font-size: 1rem;
    padding: 0.35rem 0.75rem;
    margin-top: 1rem;
    display: inline-block;
    color: white;
    background: $color6;
    &:disabled {
      cursor: not-allowed;
    }
  }
}
.search-results {
  height: 250px;
  width: 300px;
  color: white;
  background: #333;
  .results-title {
    margin-top: 1rem;
    .close-btn {
      margin-top: -0.5rem;
      margin-right: 0.25rem;
      float: right;
      background: none;
      svg {
        color: white;
        font-size: 1rem;
      }
    }
    h4 {
      display: inline-block;
      padding-left: 0.5rem;
    }
  }
  .results {
    max-height: 60%;
    overflow-y: auto;
    ul {
      .no-results {
        text-align: center;
      }
      li {
        .picture {
          display: inline-block;
          padding: 0.5rem;
          img {
            vertical-align: middle;
            height: 2.5rem;
            width: 2.5rem;
          }
        }
        .user {
          display: inline-block;
          vertical-align: middle;
          height: 100%;
          .link {
            display: block;
            color: white;
            text-decoration: none;
          }
          button {
            margin-top: 0.25rem;
            margin-right: 0.5rem;
          }
        }
        &:hover {
          background: black;
        }
      }
    }
  }
}
</style>
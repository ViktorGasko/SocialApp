<template>
  <div>
    <div class="setting-header">
      <h2>Settings</h2>
      <router-link
        class="link"
        :to="{
          name: 'Group',
          params: { id: $props.id },
        }"
        >Return</router-link
      >
    </div>
    <div v-if="rank > 4">
      <div class="setting">
        <h3>Add Member</h3>
        <add-member :id="id" />
      </div>
      <div class="setting"><h3>Remove Member</h3></div>
      <div class="setting"><h3>Change Members Rank</h3></div>
      <div class="setting"><h3>Join Requests</h3></div>
      <div class="setting"><h3>Rank Requests</h3></div>
    </div>
    <div class="setting" v-if="rank > 5">
      <h3>Group Picture</h3>
      <input type="file" @change="checkPicture" />
      <button @click="addProfilePicture">setPicture</button>
    </div>
    <div class="setting" v-if="rank"><h3>Request Promotion</h3></div>
    <div class="setting"><h3>Leave Group</h3></div>
    <div class="setting" v-if="rank > 5"><h3>Delete Group</h3></div>
  </div>
</template>

<script>
import { projectFirestore } from "../firebase/config";
import AddMember from "../components/groupSettings/AddMember.vue";
export default {
  components: {
    AddMember,
  },
  props: ["id"],
  data() {
    return { user: null, picture: null, rank: null };
  },
  created() {
    this.user = this.$store.getters.getUser;
    projectFirestore
      .collection("user")
      .doc(this.user.uid)
      .collection("groups")
      .doc(this.$props.id)
      .get()
      .then((res) => {
        this.rank = res.data().rank;
      });
  },
  methods: {
    async addProfilePicture() {
      await this.$store.dispatch("addProfilePic", {
        user: this.$store.getters.getUser,
        picture: this.picture,
      });
    },
    async removeProfilePicture() {
      await this.$store.dispatch("removeProfilePicture", {
        user: this.$store.getters.getUser,
      });
    },
    checkPicture(e) {
      const file = e.target.files[0];
      if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
        Object.defineProperty(file, "name", {
          writable: true,
          value: "profilePic",
        });
        this.picture = file;
      } else if (file) {
        console.log("Choose file of type .png or .jpeg");
        this.picture = null;
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
.main-1 {
  height: 89vh;
  overflow-y: auto;
  h2,
  h3 {
    margin: 0;
  }
  h2 {
    display: inline-block;
  }
  .setting-header {
    margin: 20px;
    margin-bottom: 0;
    .link {
      float: right;
      text-decoration: none;
      padding: 10px 20px;
      margin-top: -4px;
      background: $color6;
      color: white;
    }
  }
  .setting {
    margin: 20px;
  }
}
h1 {
  color: white;
  font-size: 100px;
}
</style>
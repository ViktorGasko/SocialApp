<template>
  <div class="profile" v-if="user">
    <div class="profile-header">
      <div class="picture-1" @click="showProfilePic">
        <img :src="user.photoUrl" alt="" />
      </div>
      <div class="header-1">
        <h2>{{ user.displayName }}</h2>
        <button @click="showSettings" v-if="isUser">
          <p><font-awesome-icon icon="user-cog" /><i>Settings</i></p>
        </button>
        <button @click="showGroups" v-if="isUser">
          <p><font-awesome-icon icon="users" /><i>Groups</i></p>
        </button>
        <button @click="handleContact" v-if="!isUser">
          <p>{{ addContactButton }}</p>
        </button>
        <button @click="handleFollow" v-if="!isUser">
          <p>{{ followButton }}</p>
        </button>
      </div>
    </div>
    <new-post v-if="isUser" :groupId="''" :userId="id" @newPost="addPost" />
    <post
      v-for="post in userPosts"
      :key="post.postId"
      :photo="post.url"
      :text="post.text"
      :userId="post.userId"
      :postId="post.postId"
      :timestamp="post.timestamp"
      :loggedUserPhoto="loggedUser.photoURL"
      :loggedUserName="loggedUser.displayName"
      :loggedUserId="loggedUser.uid"
    />
  </div>
</template>

<script>
import { projectFirestore } from "../firebase/config";
import { timestamp } from "@/firebase/config";
import NewPost from "../components/NewPost.vue";
import Post from "../components/Post.vue";

export default {
  components: {
    NewPost,
    Post,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showProfilePicture: false,
      user: { displayName: "", photoUrl: "" },
      loggedUser: this.$store.getters.getUser,
      userPosts: [],
      addContactButton: "",
      followButton: "",
    };
  },
  computed: {
    isUser() {
      return this.$props.id === this.$store.getters.getUser.uid;
    },
  },
  methods: {
    showSettings() {
      this.$router.push({
        name: "Settings",
      });
    },
    showGroups() {
      this.$router.push({
        name: "MyGroups",
      });
    },
    showProfilePic() {
      if (
        this.user.photoUrl ===
        "https://firebasestorage.googleapis.com/v0/b/vue-http-demo-46312.appspot.com/o/files%2FDefaultProfilePic%2Fdefault.png?alt=media&token=13cec218-34f9-4e0b-b2a2-573cfc576bc5"
      ) {
        return;
      }
      this.showProfilePicture = true;
      this.$router.push({
        name: "Picture",
        params: { picId: this.$props.id },
        query: { type: "profilePic" },
      });
    },
    handleFollow() {
      const loggedUserRef = projectFirestore
        .collection("user")
        .doc(this.loggedUser.uid)
        .collection("follows")
        .doc(this.$props.id);
      const profileUserRef = projectFirestore
        .collection("user")
        .doc(this.$props.id)
        .collection("followers")
        .doc(this.loggedUser.uid);
      if (this.followButton === "Follow") {
        loggedUserRef.set({
          follow: true,
        });
        profileUserRef.set({
          follow: true,
        });
        this.followButton = "Unfollow";
      } else {
        loggedUserRef.delete();
        profileUserRef.delete();
        this.followButton = "Follow";
      }
    },
    handleContact() {
      const loggedUserRef = projectFirestore
        .collection("user")
        .doc(this.loggedUser.uid)
        .collection("contact")
        .doc(this.$props.id);
      const profileUserRef = projectFirestore
        .collection("user")
        .doc(this.$props.id)
        .collection("contactRequests")
        .doc(this.loggedUser.uid);
      if (this.addContactButton === "Add Contact") {
        loggedUserRef.set({
          contact: "pending",
        });
        profileUserRef.set({
          timestamp: timestamp(),
        });
        this.addContactButton = "Pending";
      } else {
        loggedUserRef.delete();
        profileUserRef.delete();
      }
    },
    addPost(post) {
      this.userPosts.unshift(post);
    },
    async onEnter() {
      this.user = { displayName: "", photoUrl: "" };
      this.userPosts = [];
      projectFirestore
        .collection("user")
        .doc(this.loggedUser.uid)
        .collection("contact")
        .doc(this.$props.id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const contact = doc.data().contact;
            if (contact === false) {
              this.addContactButton = "Add Contact";
            } else if (contact === true) {
              this.addContactButton = "Remove Contact";
            } else {
              this.addContactButton = "Pending";
            }
          } else {
            this.addContactButton = "Add Contact";
          }
        });
      projectFirestore
        .collection("user")
        .doc(this.loggedUser.uid)
        .collection("follow")
        .doc(this.$props.id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const follow = doc.data().follow;
            if (follow === false) {
              this.followButton = "Follow";
            } else {
              this.followButton = "Unfollow";
            }
          } else {
            this.followButton = "Follow";
          }
        });
      const ref = projectFirestore.collection("user").doc(this.$props.id);
      ref.get().then((doc) => {
        this.user = doc.data();
      });
      await this.$store
        .dispatch("loadDefault", {
          type: "user",
          id: this.$props.id,
        })
        .then((posts) => (this.userPosts = [...posts]));
      window.addEventListener("scroll", this.checkPosition);
    },
    async loadPosts() {
      const timestamp = this.userPosts[this.userPosts.length - 1].timestamp;
      await this.$store
        .dispatch("loadAdditional", {
          type: "user",
          id: this.$props.id,
          timestamp: timestamp,
        })
        .then((posts) => (this.userPosts = [...this.userPosts, ...posts]));
    },
    checkPosition() {
      if (
        window.innerHeight + window.scrollY >=
          document.scrollingElement.scrollHeight &&
        this.userPosts.length
      ) {
        this.loadPosts();
      }
    },
  },
  async created() {
    await this.onEnter();
  },
  unmounted() {
    window.removeEventListener("scroll", this.checkPosition);
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";

.profile-header {
  margin: 20px;
  margin-top: 10px;
  border-bottom: 1px solid $color5;
  display: flex;
}
.header-1 {
  flex: auto;
  h2 {
    color: $color6;
  }
  button {
    margin-top: 10px;
    margin-left: 20px;
    float: right;
    background: $color6;
    border: none;
    padding: 0 15px;
    &:hover {
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
.picture-1 {
  margin: 5px 10px 10px 0;
  height: 120px;
  width: 120px;
  img {
    border: 1px solid $color6;
    width: inherit;
    height: inherit;
    object-fit: cover;
  }
}
</style>
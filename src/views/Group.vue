<template>
  <div class="profile">
    <div class="profile-header">
      <div class="picture-1" @click="showProfilePic">
        <img :src="groupHeader.photoUrl" />
      </div>
      <div class="header-1">
        <h2>{{ groupHeader.name }}</h2>
        <button v-if="userData.rank !== 'rank0'" @click="groupSettings">
          <p><font-awesome-icon icon="cog" /><i>Settings</i></p>
        </button>
        <button @click="handleJoin">
          <p>
            <font-awesome-icon
              icon="plus"
              v-if="joinButton === 'Join Group'"
            /><i>{{ joinButton }}</i>
          </p>
        </button>
        <button @click="handleFollow" v-if="showFollow">
          <p>{{ followButton }}</p>
        </button>
      </div>
    </div>
    <new-post
      :groupId="id"
      :userId="user.uid"
      v-if="visibleNewPost"
      @newPost="addPost"
    />
    <!-- mainData zatial pouzijem na posielanie komentaru... ale casom to asi bude potrebne zmenit-->
    <div v-if="visiblePosts">
      <post
        v-for="post in groupPosts"
        :key="post.id"
        :photo="post.url"
        :text="post.text"
        :groupId="id"
        :userId="post.userId"
        :postId="post.postId"
        :timestamp="post.timestamp"
        :loggedUserPhoto="user.photoURL"
        :loggedUserName="user.displayName"
        :loggedUserId="user.uid"
      />
    </div>
  </div>
</template>

<script>
import NewPost from "../components/NewPost.vue";
import { projectFirestore } from "../firebase/config";
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
      user: this.$store.getters.getUser,
      joinButton: "Join Group",
      followButton: "Follow",
      possibleFollow: false,
      showFollow: false,
      ranks: {},
      userData: { rank: null },
      groupPosts: [],
      groupHeader: { name: "", photoUrl: "" },
    };
  },
  computed: {
    visibleNewPost() {
      return (
        this.userData.rank === "creator" || this.ranks[this.userData.rank] >= 3
      );
    },
    visiblePosts() {
      return (
        this.userData.rank === "creator" || this.ranks[this.userData.rank] >= 1
      );
    },
  },
  async created() {
    projectFirestore
      .collection("groups")
      .doc(this.$props.id)
      .get()
      .then((res) => {
        this.groupHeader["name"] = res.data().name;
        this.groupHeader["photoUrl"] = res.data().photoUrl;
        this.ranks = res.data().ranks;
        if (this.ranks["rank0"] !== null) {
          this.possibleFollow = true;
        }
        projectFirestore
          .collection("user")
          .doc(this.user.uid)
          .collection("groups")
          .doc(this.$props.id)
          .get()
          .then((res) => {
            if (res.exists) {
              this.userData = res.data();
            } else {
              this.userData = {
                rank: "rank0",
              };
            }
            if (!res.exists && this.possibleFollow) {
              this.showFollow = true;
            } else if (res.data().rank === "rank0" && this.possibleFollow) {
              this.showFollow = true;
              this.followButton = "Unfollow";
            } else if (!res.exists) {
              return;
            } else {
              this.joinButton = "Leave Group";
            }
          });
      });
    await this.$store
      .dispatch("loadDefault", {
        type: "groups",
        id: this.$props.id,
      })
      .then((posts) => (this.groupPosts = [...posts]));
    window.addEventListener("scroll", this.checkPosition);
  },
  methods: {
    groupSettings() {
      this.$router.push({
        name: "GroupSettings",
        params: { id: this.$props.id },
        query: { type: this.userData.rank },
      });
    },
    showProfilePic() {
      // this.showProfilePicture = true;
      // this.$router.push({
      //   name: "Picture",
      //   params: { picId: this.$props.id },
      //   query: { type: "profilePic" },
      // });
    },
    handleFollow() {
      if (this.followButton === "Follow") {
        projectFirestore
          .collection("user")
          .doc(this.user.uid)
          .collection("groups")
          .doc(this.$props.id)
          .set({
            rank: "rank0",
          });
        projectFirestore
          .collection("groups")
          .doc(this.$props.id)
          .collection("members")
          .doc(this.user.uid)
          .set({
            rank: "rank0",
          });
        this.followButton = "Unfollow";
      } else {
        projectFirestore
          .collection("user")
          .doc(this.user.uid)
          .collection("follow")
          .doc(this.$props.id)
          .delete();
        projectFirestore
          .collection("groups")
          .doc(this.$props.id)
          .collection("members")
          .doc(this.user.uid)
          .delete();
        this.followButton = "Follow";
      }
    },
    addPost(post) {
      this.groupPosts.unshift(post);
    },
    async loadPosts() {
      const timestamp = this.groupPosts[this.groupPosts.length - 1].timestamp;
      await this.$store
        .dispatch("loadAdditional", {
          type: "groups",
          id: this.$props.id,
          timestamp: timestamp,
        })
        .then((posts) => (this.groupPosts = [...this.groupPosts, ...posts]));
    },
    checkPosition() {
      if (
        window.innerHeight + window.scrollY >=
          document.scrollingElement.scrollHeight &&
        this.groupPosts.length
      ) {
        this.loadPosts();
      }
    },
    unmounted() {
      window.removeEventListener("scroll", this.checkPosition);
    },
    handleJoin() {
      // if (this.addContactButton === "Add Contact") {
      //   projectFirestore
      //     .collection("user")
      //     .doc(this.$store.getters.getUser.uid)
      //     .collection("contact")
      //     .doc(this.$props.id)
      //     .set({
      //       contact: "pending",
      //     });
      //   projectFirestore
      //     .collection("user")
      //     .doc(this.$props.id)
      //     .collection("contactRequests")
      //     .doc(this.$store.getters.getUser.uid)
      //     .set({
      //       timestamp: timestamp(),
      //     });
      //   this.addContactButton = "Pending";
      // } else {
      //   projectFirestore
      //     .collection("user")
      //     .doc(this.$store.getters.getUser.uid)
      //     .collection("contact")
      //     .doc(this.$props.id)
      //     .delete();
      //   if (this.addContactButton === "Pending") {
      //     projectFirestore
      //       .collection("user")
      //       .doc(this.$props.id)
      //       .collection("contactRequests")
      //       .doc(this.$store.getters.getUser.uid)
      //       .delete();
      //   } else {
      //     projectFirestore
      //       .collection("user")
      //       .doc(this.$props.id)
      //       .collection("contact")
      //       .doc(this.$store.getters.getUser.uid)
      //       .delete();
      //   }
      // }
    },
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
    height: 2.75rem;
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
        padding-bottom: 12px;
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
    border: 1px solid black;
    width: inherit;
    height: inherit;
    object-fit: cover;
  }
}
</style>
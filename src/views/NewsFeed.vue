<template>
  <div class="newsfeed" id="newsfeed">
    <new-post :groupId="''" :userId="user.uid" @newPost="addPost" />
    <post
      v-for="post in newPosts"
      :key="post.postId"
      :photo="post.url"
      :text="post.text"
      :userId="post.userId"
      :postId="post.postId"
      :timestamp="post.timestamp"
      :loggedUserPhoto="user.photoURL"
      :loggedUserName="user.displayName"
      :loggedUserId="user.uid"
    />
  </div>
</template>

<script>
import { projectFirestore } from "../firebase/config";
import NewPost from "../components/NewPost.vue";
import Post from "../components/Post.vue";

export default {
  components: {
    NewPost,
    Post,
  },
  data() {
    return {
      user: this.$store.getters.getUser,
      newPosts: [],
    };
  },
  created() {
    window.addEventListener("scroll", this.checkPosition);
    projectFirestore
      .collection("user")
      .doc(this.user.uid)
      .collection("newsFeed")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get()
      .then((posts) => {
        posts.forEach((el) => {
          let col = "user";
          if (el.data().group) {
            col = "groups";
          }
          projectFirestore
            .collection(col)
            .doc(el.data().id)
            .collection("posts")
            .doc(el.id)
            .get()
            .then((post) => {
              this.newPosts.push({ ...post.data(), postId: post.id });
            });
        });
      });
  },
  unmounted() {
    window.removeEventListener("scroll", this.checkPosition);
  },
  methods: {
    loadPosts() {
      const timestamp = this.newPosts[this.newPosts.length - 1].timestamp;
      projectFirestore
        .collection("user")
        .doc(this.user.uid)
        .collection("newsFeed")
        .where("timestamp", "<", timestamp)
        .orderBy("timestamp", "desc")
        .limit(10)
        .get()
        .then((posts) => {
          posts.forEach((el) => {
            let col = "user";
            if (el.data().group) {
              col = "groups";
            }
            projectFirestore
              .collection(col)
              .doc(el.data().id)
              .collection("posts")
              .doc(el.id)
              .get()
              .then((post) => {
                this.newPosts.push({ ...post.data(), postId: post.id });
              });
          });
        });
    },
    addPost(post) {
      this.newPosts.unshift(post);
    },
    checkPosition() {
      if (
        window.innerHeight + window.scrollY >=
          document.scrollingElement.scrollHeight &&
        this.newPosts.length
      ) {
        this.loadPosts();
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
</style>
<template>
  <div class="container">
    <div class="header">
      <img :src="userPhoto" alt="" />
      <div class="header-text">
        <router-link
          class="link"
          :to="{
            name: 'Profile',
            params: { id: userId },
          }"
          >{{ userName }}</router-link
        >
        <p>{{ time }}</p>
      </div>
    </div>
    <div v-if="text" class="text">{{ text }}</div>
    <div v-if="photo" class="photo"><img :src="photo" alt="" /></div>
    <div class="footer">
      <button
        @click="vote(loggedUserId, 1)"
        :class="[{ voted: voted === 1 }, 'btn-vote']"
      >
        <font-awesome-icon icon="arrow-circle-up" />
      </button>
      <button
        @click="vote(loggedUserId, -1)"
        :class="[{ voted: voted === -1 }, 'btn-vote']"
      >
        <font-awesome-icon icon="arrow-circle-down" />
      </button>
      <h3 v-if="total">{{ total }}</h3>
      <button
        @click="showComments"
        :class="[{ active: comments }, 'btn-comment']"
      >
        Comments
      </button>
    </div>
    <div class="comment-section" v-if="commentsVisible">
      <div id="textarea-body-2">
        <textarea
          data-expandable
          id="textarea-2"
          placeholder="Write comment..."
          v-on:keydown="textAreaHeight"
          v-on:click="textAreaHeight"
          v-model.trim="comment"
          v-on:keydown.enter.exact.prevent="sendComment"
          rows="1"
          style="width: 100%"
        ></textarea>
        <div id="textarea-div-2" style="height: auto">XXX{{ comment }}</div>
      </div>
      <div class="comments">
        <comment
          v-for="comment in comments"
          :key="comment.commentId"
          :comment="comment"
          :postUserId="userId"
          :loggedUserId="loggedUserId"
        />
        <button
          class="load-comments"
          v-if="showLoadMoreComments"
          @click="loadMoreComments"
        >
          Load More Comments
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import { projectFirestore, FieldValue } from "../firebase/config";
import { timestamp } from "@/firebase/config";
import Comment from "./Comment.vue";

export default {
  components: {
    Comment,
  },
  props: [
    "text",
    "photo",
    "timestamp",
    "postId",
    "userId",
    "loggedUserPhoto",
    "loggedUserName",
    "loggedUserId",
  ],
  data() {
    return {
      userName: "",
      userPhoto: "",
      comment: "",
      commentsVisible: false,
      comments: [],
      voted: null,
      total: null,
      showLoadMoreComments: false,
      refVotes: projectFirestore
        .collection("user")
        .doc(this.$props.userId)
        .collection("posts")
        .doc(this.$props.postId)
        .collection("votes"),
      refComments: projectFirestore
        .collection("user")
        .doc(this.$props.userId)
        .collection("posts")
        .doc(this.$props.postId)
        .collection("comments"),
    };
  },
  created() {
    projectFirestore
      .collection("user")
      .doc(this.$props.userId)
      .get()
      .then((doc) => {
        this.userName = doc.data().displayName;
        this.userPhoto = doc.data().photoUrl;
      });
    this.refVotes
      .doc(this.$props.loggedUserId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          this.voted = doc.data().value;
        } else {
          return;
        }
      });
    this.refVotes
      .doc("total")
      .get()
      .then((doc) => {
        if (doc.exists) {
          this.total = doc.data().total;
        } else {
          return;
        }
      });
  },
  computed: {
    time() {
      const postTime = new Date(this.$props.timestamp.seconds * 1000);
      const currentTime = new Date(Date.now());
      if (currentTime - postTime < 3540000) {
        return (
          Math.round((currentTime - postTime) / 60000 + 1).toString() +
          " min. ago"
        );
      } else if (postTime.getYear() !== currentTime.getYear()) {
        return (
          postTime.getDate() +
          ". " +
          postTime.toLocaleString("default", { month: "long" }) +
          " " +
          postTime.getFullYear()
        );
      } else {
        let minutes = postTime.getMinutes();
        if (postTime.getMinutes() < 10) {
          minutes = "0" + minutes;
        }
        return (
          postTime.getDate() +
          ". " +
          postTime.toLocaleString("default", { month: "long" }) +
          " " +
          postTime.getHours() +
          ":" +
          minutes
        );
      }
    },
  },
  methods: {
    textAreaHeight() {
      const el = document.getElementById("textarea-2");
      const div = document.getElementById("textarea-div-2");
      const textareaWrap = document.getElementById("textarea-body-2");
      const divInt = getComputedStyle(div).height.match(/\d+/)[0];
      if (parseInt(divInt) < 130) {
        el.style.overflowY = "hidden";
        if (!div.style.width) {
          div.style.width = getComputedStyle(el).width;
        }
        textareaWrap.style.height = getComputedStyle(div).height;
        el.style.height = getComputedStyle(div).height;
      } else {
        el.style.height = "145px";
        textareaWrap.style.height = "145px";
        el.style.overflowY = "auto";
      }
    },
    vote(id, value) {
      let toTotal = value;
      if (this.voted === -value) {
        toTotal = 2 * toTotal;
        this.voted = value;
        this.refVotes.doc(id).set({
          value: value,
        });
      } else if (value === this.voted) {
        toTotal = -toTotal;
        this.voted = null;
        this.refVotes.doc(id).delete();
      } else {
        this.voted = value;
        this.refVotes.doc(id).set({
          value: value,
        });
      }
      this.refVotes
        .doc("total")
        .get()
        .then((doc) => {
          try {
            if (doc.exists) {
              this.refVotes.doc("total").update({
                total: FieldValue.increment(toTotal),
              });
              this.total = doc.data().total + toTotal;
            } else {
              this.refVotes.doc("total").set({
                total: value,
              });
              this.total = value;
            }
          } catch (err) {
            console.log(err);
          }
        });
    },
    showComments() {
      this.commentsVisible = !this.commentsVisible;
      this.comment = "";
      if (this.comments.length > 10 && !this.commentsVisible) {
        this.comments = this.comments.slice(0, 10);
        this.showLoadMoreComments = true;
      } else if (this.comments.length === 0 && this.commentsVisible) {
        this.refComments
          .orderBy("timestamp", "desc")
          .limit(10)
          .get()
          .then((res) => {
            this.showLoadMoreComments = res.docs.length === 10;
            for (var i = 0; i < res.docs.length; i++) {
              const data = { ...res.docs[i].data(), commentId: res.docs[i].id };
              projectFirestore
                .collection("user")
                .doc(res.docs[i].data().userId)
                .get()
                .then((userData) => {
                  if (userData.exists) {
                    this.comments.push({
                      ...data,
                      userName: userData.data().displayName,
                      userPhotoUrl: userData.data().photoUrl,
                    });
                  }
                });
            }
          });
      }
    },
    loadMoreComments() {
      const timestamp = this.comments[this.comments.length - 1].timestamp;
      this.refComments
        .where("timestamp", "<", timestamp)
        .limit(10)
        .get()
        .then((res) => {
          this.showLoadMoreComments = res.docs.length === 10;
          for (var i = res.docs.length - 1; i >= 0; i--) {
            const data = { ...res.docs[i].data(), commentId: res.docs[i].id };
            projectFirestore
              .collection("user")
              .doc(res.docs[i].data().userId)
              .get()
              .then((userData) => {
                if (userData.exists) {
                  this.comments.push({
                    ...data,
                    userName: userData.data().displayName,
                    userPhotoUrl: userData.data().photoUrl,
                  });
                }
              });
          }
        });
    },
    sendComment() {
      if (this.comment) {
        let commentId;
        this.refComments
          .add({
            postId: this.$props.postId,
            userId: this.$props.loggedUserId,
            timestamp: timestamp(),
            text: this.comment,
            total: 0,
          })
          .then((res) => {
            commentId = res.id;
            projectFirestore
              .collection("user")
              .doc(this.$store.getters.getUser.uid)
              .collection("comments")
              .doc(commentId)
              .set({
                postId: this.$props.postId,
                commentId: commentId,
                postOwnerId: this.$props.userId,
                timestamp: timestamp(),
                text: this.comment,
              });
            this.comments.unshift({
              commentId: commentId,
              postId: this.$props.postId,
              userId: this.$props.loggedUserId,
              timestamp: { seconds: Date.now() / 1000 },
              text: this.comment,
              total: 0,
              userName: this.$props.loggedUserName,
              userPhotoUrl: this.$props.loggedUserPhoto,
            });
            this.comment = "";
          });
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";

.container {
  margin: 20px;
  padding: 15px;
  background: $color4;
  border: 2px solid #666;
  display: flex;
  flex-direction: column;
  .header {
    padding: 10px;
    img {
      float: left;
      height: 80px;
      width: 80px;
      margin-right: 15px;
      object-fit: cover;
    }
    .header-text {
      margin: 5px;
      .link {
        text-decoration: none;
        font-weight: bold;
        font-size: 1.15rem;
      }
    }
  }
  .text {
    padding: 10px;
    padding-bottom: 20px;
  }
  .photo {
    background: black;
    width: 100%;
    height: auto;
    img {
      // display block aby pod img nezostavala mala medzera
      display: block;
      margin: auto;
      max-width: 100%;
      max-height: 75vh;
      object-fit: cover;
    }
  }
  .footer {
    margin-top: 10px;
    width: 100%;
    position: relative;
    h3 {
      display: inline-block;
      padding: 0 10px;
      margin: 0;
    }
    button {
      background: none;
      svg {
        font-size: 1.5rem;
      }
    }
    .btn-comment {
      float: right;
      font-size: 1rem;
      padding: 10px;
      &:hover {
        background-color: opacify($color6, 0.9);
        color: white;
      }
    }
    .active {
      background-color: opacify($color6, 0.9);
      color: white;
    }
    .voted {
      color: $color6;
    }
  }
  .comment-section {
    #textarea-body-2 {
      height: 39px;
      width: 80%;
      #textarea-2 {
        overflow: hidden;
        height: inherit;
        box-sizing: border-box;
        border: 1px solid white;
        margin-top: 10px;
        padding: 10px;
        resize: none;
        font-size: 1rem;
        outline: none;
        &:active,
        &:focus,
        &:hover {
          border-color: $color6;
        }
      }
      #textarea-div-2 {
        margin-top: 10px;
        padding: 10px;
        position: absolute;
        visibility: hidden;
        display: none;
        left: -9999px;
        font-size: 1rem;
        display: inline-block;
        word-wrap: break-word;
      }
    }
    .comments {
      margin-top: 20px;
      .load-comments {
        color: white;
        display: block;
        background: $color6;
        margin: 5px auto;
        padding: 5px;
      }
    }
  }
}
</style>
<template>
  <div class="comment">
    <div class="comment-header">
      <div class="img">
        <img :src="comment.userPhotoUrl" alt="" />
      </div>
      <div class="comment-header2">
        <router-link
          class="link"
          :to="{
            name: 'Profile',
            params: { id: userId },
          }"
          >{{ comment.userName }}</router-link
        >
        {{ time }}
        <button
          @click="vote(userId, 1)"
          :class="[{ voted: voted === 1 }, 'btn-vote']"
        >
          <font-awesome-icon icon="arrow-circle-up" />
        </button>
        <button
          @click="vote(userId, -1)"
          :class="[{ voted: voted === -1 }, 'btn-vote']"
        >
          <font-awesome-icon icon="arrow-circle-down" />
        </button>
        <p v-if="total">{{ total }}</p>
      </div>
    </div>
    <div class="comment-content">
      <p>{{ comment.text }}</p>
    </div>
  </div>
</template>

<script>
import { projectFirestore, FieldValue } from "../firebase/config";
export default {
  props: ["comment", "postUserId", "loggedUserId", "groupId"],
  data() {
    return {
      total: this.$props.comment.total,
      voted: null,
      userId: this.$store.getters.getUser.uid,
      refPost: this.$props.groupId
        ? projectFirestore
            .collection("groups")
            .doc(this.$props.groupId)
            .collection("posts")
            .doc(this.$props.comment.postId)
            .collection("comments")
            .doc(this.$props.comment.commentId)
        : projectFirestore
            .collection("user")
            .doc(this.$props.postUserId)
            .collection("posts")
            .doc(this.$props.comment.postId)
            .collection("comments")
            .doc(this.$props.comment.commentId),
    };
  },
  computed: {
    time() {
      const postTime = new Date(this.$props.comment.timestamp.seconds * 1000);
      const currentTime = new Date(Date.now());
      if (currentTime - postTime < 3540000) {
        return (
          Math.round((currentTime - postTime) / 60000 + 1).toString() + " min."
        );
      } else if (currentTime - postTime < 3600000 * 24) {
        return (
          Math.round((currentTime - postTime) / 3600000 + 1).toString() + " h."
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
        return (
          postTime.getDate() +
          ". " +
          postTime.toLocaleString("default", { month: "long" })
        );
      }
    },
  },
  created() {
    this.refPost
      .collection("votes")
      .doc(this.$props.loggedUserId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          this.voted = doc.data().value;
        } else {
          return;
        }
      });
  },
  methods: {
    vote(id, value) {
      let toTotal = value;
      if (this.voted === -value) {
        toTotal = 2 * toTotal;
        this.voted = value;
        this.refPost.collection("votes").doc(id).set({
          value: value,
        });
      } else if (value === this.voted) {
        toTotal = -toTotal;
        this.voted = null;
        this.refPost.collection("votes").doc(id).delete();
      } else {
        this.voted = value;
        this.refPost.collection("votes").doc(id).set({
          value: value,
        });
      }
      this.refPost.get().then((doc) => {
        try {
          if (doc.exists) {
            this.refPost.update({
              total: FieldValue.increment(toTotal),
            });
            this.total = doc.data().total + toTotal;
          } else {
            this.refPost.set({
              total: value,
            });
            this.total = value;
          }
        } catch (err) {
          console.log(err);
        }
      });
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
.comment {
  background: $color4;
  border: 2px solid #666;
  margin: 0.5rem 0;
  padding: 0.5rem;
  .comment-header {
    margin-bottom: 0.5rem;
    .img {
      margin-right: 1rem;
      float: left;
      img {
        width: 3rem;
        height: 3rem;
      }
    }
    .comment-header2 {
      .link {
        text-decoration: none;
        font-weight: bold;
        display: block;
        padding-bottom: 0.25rem;
      }
      .btn-vote {
        margin: 0 0.25rem;
        padding: 0;
        background: none;
        svg {
          font-size: 1rem;
        }
      }
      .voted {
        color: $color6;
      }
      p {
        display: inline-block;
        margin: 0;
        margin-left: 0.5rem;
      }
    }
  }
}
</style>
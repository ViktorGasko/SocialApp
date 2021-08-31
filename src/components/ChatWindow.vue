<template>
  <div class="container">
    <div class="chat-head">
      <img :src="userData.photoUrl" alt="" />
      <router-link
        class="link"
        :to="{
          path: `/profile/${id}`,
        }"
        ><h3>{{ userData.displayName }}</h3></router-link
      >
      <button class="btn" @click="closeChat">
        <p>
          <font-awesome-icon icon="times" />
        </p>
      </button>
      <button class="btn">
        <p>
          <font-awesome-icon icon="chevron-down" />
        </p>
      </button>
    </div>
    <div
      class="chat-body"
      id="chat-body"
      style="height: 361px"
      @scroll="scroll"
    >
      <div class="msg-insert">
        <div
          v-for="message in messages"
          :key="message.timestamp"
          :class="message.user === id ? 'msg-receive' : 'msg-send'"
        >
          {{ message.message }}
        </div>
      </div>
    </div>
    <div class="chat-text">
      <textarea
        data-expandable
        id="message-textarea"
        placeholder="Send"
        v-on:keydown="textAreaHeight"
        v-on:click="textAreaHeight"
        v-on:keydown.enter.exact.prevent="sendMessage"
        v-model.trim="message"
        rows="1"
        style="width: 300px"
      ></textarea>
      <div id="message-textarea-div" style="height: auto">XXX{{ message }}</div>
    </div>
  </div>
</template>

<script>
import { projectFirestore, timeNow, timestamp } from "../firebase/config";
export default {
  props: ["id"],
  data() {
    return {
      message: "",
      userData: { displayName: "", photoUrl: "" },
      messages: [],
      listener: null,
    };
  },
  created() {
    projectFirestore
      .collection("user")
      .doc(this.$props.id)
      .get()
      .then((res) => {
        this.userData = res.data();
      });
    projectFirestore
      .collection("user")
      .doc(this.$store.getters.getUser.uid)
      .collection("coversations")
      .doc(this.$props.id)
      .collection("conversation")
      .orderBy("timestamp", "desc")
      .limit(20)
      .get()
      .then((res) => {
        if (!res.empty) {
          for (let i = res.docs.length - 1; i >= 0; i--) {
            this.messages.push(res.docs[i].data());
          }
        }
        this.listener = projectFirestore
          .collection("user")
          .doc(this.$store.getters.getUser.uid)
          .collection("coversations")
          .doc(this.$props.id)
          .collection("conversation")
          .where("timestamp", ">=", timeNow.now())
          .onSnapshot((bla) => {
            if (bla.docChanges().length > 0) {
              this.messages.push(bla.docChanges()[0].doc.data());
            }
          });
      })
      .then(() => {
        const element = document.getElementById("chat-body");
        element.scrollTop = element.scrollHeight - element.clientHeight;
      });
  },
  beforeUnmount() {
    this.listener = this.listener();
    this.messages = [];
    // console.log("unmounted", this.messages, this.listener(), this.listener);
  },
  methods: {
    closeChat() {
      this.$emit("closeChat", this.$props.id);
    },
    scroll() {
      const element = document.getElementById("chat-body");
      element.sc;
      if (element.scrollTop === 0) {
        projectFirestore
          .collection("user")
          .doc(this.$store.getters.getUser.uid)
          .collection("coversations")
          .doc(this.$props.id)
          .collection("conversation")
          .where("timestamp", "<", this.messages[0].timestamp)
          .orderBy("timestamp")
          .limit(20)
          .get()
          .then((res) => {
            if (!res.empty) {
              for (let i = res.docs.length - 1; i >= 0; i--) {
                this.messages.unshift(res.docs[i].data());
              }
              element.scroll(0, 1);
            }
          });
      }
    },
    async sendMessage() {
      if (this.message) {
        await projectFirestore
          .collection("user")
          .doc(this.$store.getters.getUser.uid)
          .collection("coversations")
          .doc(this.$props.id)
          .collection("conversation")
          .add({
            timestamp: timestamp(),
            user: this.$store.getters.getUser.uid,
            message: this.message,
          });
        await projectFirestore
          .collection("user")
          .doc(this.$props.id)
          .collection("coversations")
          .doc(this.$store.getters.getUser.uid)
          .collection("conversation")
          .add({
            timestamp: timestamp(),
            user: this.$store.getters.getUser.uid,
            message: this.message,
          });
        this.message = "";
        this.startTextArea();
        const element = document.getElementById("chat-body");
        element.scrollTop = element.scrollHeight - element.clientHeight;
      }
    },
    startTextArea() {
      const el = document.getElementById("message-textarea");
      const chatBody = document.getElementById("chat-body");
      el.style.height = "39px";
      chatBody.style.height = "361px";
      el.style.overflowY = "hidden";
    },
    textAreaHeight() {
      const el = document.getElementById("message-textarea");
      const div = document.getElementById("message-textarea-div");
      const chatBody = document.getElementById("chat-body");
      const divInt = getComputedStyle(div).height.match(/\d+/)[0];
      if (parseInt(divInt) < 130) {
        el.style.overflowY = "hidden";
        if (!div.style.width) {
          div.style.width = getComputedStyle(el).width;
        }
        // console.log(getComputedStyle(div).height);
        chatBody.style.height = 400 - parseInt(divInt) + "px";
        el.style.height = getComputedStyle(div).height;
      } else {
        el.style.height = "145px";
        chatBody.style.height = "255px";
        el.style.overflowY = "auto";
      }
    },
  },
};
</script>

<style lang='scss' scoped>
@import "../scss/_variables.scss";
* {
  padding: 0px;
  margin: 0px;
  // font-family: "Fira Code";
}

.container {
  pointer-events: auto;
  background: #555;
  width: 300px;
  height: 450px;
  margin: 0 5px;
  .chat-head {
    width: inherit;
    height: 50px;
    background: $color6;
    padding-top: 7px;
    padding-left: 7px;
    img {
      float: left;
      height: 36px;
      width: 36px;
    }
    h3 {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 175px;
      color: white;
      float: left;
      padding-left: 10px;
    }
    .btn {
      margin-right: 1rem;
      float: right;
      background: none;
      svg {
        color: white;
        font-size: 1.25rem;
      }
    }
  }
  .chat-body {
    width: inherit;
    overflow-y: auto;
    overflow-x: hidden;
    .msg-insert {
      .msg-send,
      .msg-receive {
        width: 220px;
        height: auto;
        padding: 5px;
        margin: 10px auto;
        position: relative;
        color: white;
        word-wrap: break-word;
      }
      .msg-send {
        background: $color6;
        left: 10px;
      }
      .msg-receive {
        background: #333;
        right: 10px;
      }

      .msg-receive:hover,
      .msg-send:hover {
        opacity: 0.9;
      }
    }
  }
  .chat-text {
    height: 40px;
    width: inherit;
    textarea {
      overflow: hidden;
      height: inherit;
      box-sizing: border-box;
      border: 1px solid white;
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
    #message-textarea-div {
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
}
</style>
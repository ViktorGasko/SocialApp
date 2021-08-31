<template>
  <div class="container-1">
    <div class="side-1"></div>
    <div class="main-1"><router-view :key="$route.fullPath"></router-view></div>
    <div class="side-1">
      <list
        v-if="userId"
        :id="userId"
        @openChat="openChat"
        @showGroup="showGroup"
      />
    </div>
    <div class="chat" id="chat" v-if="userId">
      <chat-window
        @closeChat="closeChat"
        v-for="chatWindow in chatWindows"
        :key="chatWindow"
        :id="chatWindow"
      />
      <chat-window
        @closeChat="closeChat"
        v-for="hiddenChat in hiddenChats"
        :key="hiddenChat"
        :id="hiddenChat"
      />
    </div>
  </div>
</template>

<script>
import List from "../components/List.vue";
import ChatWindow from "../components/ChatWindow.vue";

export default {
  components: { List, ChatWindow },
  name: "Home",
  data() {
    return {
      userId: this.$store.getters.getUser.uid,
      contactRequests: [],
      chatWindows: [],
      maxChatWindowsLen: 1,
      hiddenChats: [],
    };
  },
  computed: {
    chatLen() {
      return this.chatWindows.length;
    },
  },
  watch: {
    chatLen() {
      setTimeout(() => {
        // const el = document.getElementById("chat");
        const bodyW = document.body.clientWidth;
        if (bodyW < 900) {
          this.maxChatWindowsLen = 2;
        } else if (bodyW < 1300) {
          this.maxChatWindowsLen = 3;
        } else {
          this.maxChatWindowsLen = 4;
        }
      }, 50);
    },
  },
  methods: {
    showGroup(id) {
      this.$router.push({ name: "Group", params: { id: id } });
    },
    closeChat(e) {
      this.chatWindows = this.chatWindows.filter((el) => el !== e);
    },
    openChat(e) {
      const index = this.chatWindows.indexOf(e);
      if (index !== -1) {
        //
      } else {
        if (this.maxChatWindowsLen > this.chatWindows.length) {
          this.chatWindows.push(e);
        } else {
          const removed = this.chatWindows.shift();
          this.chatWindows.push(e);
          if (this.hiddenChats.length === 3) {
            this.hiddenChats.shift();
          }
          this.hiddenChats.push(removed);
        }
      }
    },
  },
};
</script>


<style scoped lang='scss'>
@import "../scss/_variables.scss";
.container-1 {
  position: absolute;
  top: 7vh;
  left: 0;
}
.side-1 {
  position: relative;
}
.chat {
  position: fixed;
  pointer-events: none;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  margin-right: 15px;
}
</style>
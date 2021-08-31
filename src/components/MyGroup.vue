<template>
  <div class="container" v-if="groupData2">
    <div class="header">
      <router-link
        class="link"
        :to="{
          name: 'Group',
          params: { id: groupData.id },
        }"
        >{{ groupData2.name }}</router-link
      >
      <p>{{ stringRank }}</p>
      <button @click="showLeaveleaveGroupConfirm" class="leave-btn">
        Leave Group
      </button>
      <button class="show-btn" @click="groupSettings">
        <font-awesome-icon icon="cog"></font-awesome-icon>
      </button>
    </div>
    <div class="body"></div>
    <confirm
      v-if="leaveGroupConfirm"
      :text="'Do you really want to leave group ' + groupData2.name + '?'"
      @clicked="leaveGroup"
    />
  </div>
</template>

<script>
import { projectFirestore } from "../firebase/config";
import Confirm from "./Confirm.vue";
export default {
  components: {
    Confirm,
  },
  props: ["groupData"],
  data() {
    return {
      stringRank: null,
      groupData2: null,
      leaveGroupConfirm: false,
    };
  },
  async created() {
    await projectFirestore
      .collection("groups")
      .doc(this.$props.groupData.id)
      .get()
      .then((res) => {
        this.groupData2 = res.data();
      });
    if (this.$props.groupData.rank === "creator") {
      this.stringRank = "creator";
    } else {
      this.stringRank = "Rank " + this.$props.groupData.rank.slice(-1) + ".";
    }
  },
  methods: {
    showLeaveleaveGroupConfirm() {
      this.leaveGroupConfirm = true;
    },
    groupSettings() {
      this.$router.push({
        name: "GroupSettings",
        params: { id: this.$props.groupData.id },
        query: { type: this.$props.groupData.rank },
      });
    },
    leaveGroup(e) {
      if (e === false) {
        this.leaveGroupConfirm = false;
      } else {
        projectFirestore
          .collection("user")
          .doc(this.$store.getters.getUser.uid)
          .collection("groups")
          .doc(this.$props.groupData.id)
          .delete();
        projectFirestore
          .collection("groups")
          .doc(this.$props.groupData.id)
          .collection("members")
          .doc(this.$store.getters.getUser.uid)
          .delete()
          .then(() => {
            this.$emit("reloadList", this.$props.groupData.id);
            projectFirestore
              .collection("groups")
              .doc(this.$props.groupData.id)
              .collection("members")
              .get()
              .then((res) => {
                if (res.empty) {
                  projectFirestore
                    .collection("groups")
                    .doc(this.$props.groupData.id)
                    .delete();
                }
              });
            this.leaveGroupConfirm = false;
          });
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";

.container {
  .header {
    .link {
      color: white;
      text-decoration: none;
      font-size: 1.25rem;
      font-weight: bold;
      margin-left: 2rem;
    }
    p {
      display: inline-block;
      color: #ccc;
      margin: 0;
      padding-left: 2rem;
    }
    .leave-btn {
      background: none;
      color: white;
      font-size: 1rem;
      float: right;
      padding-top: 0.2rem;
    }
    .show-btn {
      float: right;
      padding: 0;
      background: none;
      margin-right: 1.5rem;
      margin-top: 0.1rem;
      svg {
        font-size: 22px;
        color: #ccc;
      }
    }
  }
}
</style>
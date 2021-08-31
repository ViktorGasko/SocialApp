<template>
  <div class="group-list">
    <h2>My Groups</h2>
    <ul>
      <li v-for="group in userGroups" :key="group.id">
        <my-group :groupData="group" @reloadList="reloadList" />
      </li>
    </ul>
  </div>
  <div class="new-group">
    <form @submit.prevent="createGroup">
      <label for="name"><h3>Group Name</h3></label
      ><input
        type="text"
        name="name"
        placeholder="Name (min. 3 char)"
        v-model.trim="groupName"
      />
      <label for="rankNum"><h3>Num. of Ranks (1 - 5)</h3></label>
      <input
        type="number"
        name="rankNum"
        v-model="rankNumber"
        min="1"
        max="5"
      />
      <ul v-if="rankNumber">
        <li v-for="index in rankList" :key="index">
          <h3>{{ rank(rankList - index) }}</h3>
          <label class="radio">
            <input
              type="radio"
              :id="'read' + (rankList - index)"
              value="read"
              :name="rankList - index"
              @click="addPrivilage(rankList - index, 1)"
            />
            <span></span>
          </label>
          <label for="read" class="label"
            >read <span class="tooltip">User can read posts</span></label
          >
          <label class="radio">
            <input
              type="radio"
              :id="'comment' + (rankList - index)"
              value="comment"
              :name="rankList - index"
              @click="addPrivilage(rankList - index, 2)"
            />
            <span></span>
          </label>
          <label for="comment" class="label"
            >comment <span class="tooltip">User can comment posts</span></label
          >
          <label class="radio">
            <input
              type="radio"
              :id="'post' + (rankList - index)"
              value="post"
              :name="rankList - index"
              @click="addPrivilage(rankList - index, 3)"
            />
            <span></span>
          </label>
          <label for="post" class="label"
            >post <span class="tooltip">User can post</span></label
          >
          <label class="radio">
            <input
              type="radio"
              :id="'delete' + (rankList - index)"
              value="delete"
              :name="rankList - index"
              @click="addPrivilage(rankList - index, 4)"
            />
            <span></span>
          </label>
          <label for="delete" class="label"
            >delete <span class="tooltip">User can delete posts</span></label
          >
          <label class="radio">
            <input
              type="radio"
              :id="'rank' + (rankList - index)"
              value="rank"
              :name="rankList - index"
              @click="addPrivilage(rankList - index, 5)"
            />
            <span></span>
          </label>
          <label for="rank" class="label"
            >invite & rank
            <span class="tooltip"
              >User can invite to group, change ranks of lower ranked users, or
              remove these users</span
            ></label
          >
          <label class="radio" v-if="index === 1">
            <input
              type="radio"
              :id="'lead' + (rankList - index)"
              value="lead"
              :name="rankList - index"
              @click="addPrivilage(rankList - index, 6)"
            />
            <span></span>
          </label>
          <label for="lead" class="label" v-if="index === 1"
            >lead
            <span class="tooltip"
              >User can set all ranks or delete group</span
            ></label
          >
        </li>
        <li><p>*Creator has all rights (can be remove by lead)</p></li>
      </ul>
      <input type="submit" :disabled="groupName.length < 3" value="Submit" />
    </form>
  </div>
</template>

<script>
// import { projectStorage } from "../firebase/config.js";
import { timestamp } from "@/firebase/config";
import { projectFirestore, projectStorage } from "../firebase/config";
import MyGroup from "../components/MyGroup.vue";

export default {
  components: {
    MyGroup,
  },
  data() {
    return {
      userGroups: [],
      groupName: "",
      rankNumber: null,
      rankArr: {
        rank0: null,
        rank1: null,
        rank2: null,
        rank3: null,
        rank4: null,
        rank5: null,
      },
    };
  },
  computed: {
    rankList() {
      if (this.rankNumber > 5) {
        return 6;
      } else if (this.rankNumber < 1) {
        return 1;
      } else {
        return parseInt(this.rankNumber) + 1;
      }
    },
  },
  methods: {
    rank(num) {
      if (num === 0) {
        return "Unranked";
      } else {
        return "Rank " + num + ".";
      }
    },
    addPrivilage(index, int) {
      if (this.rankArr["rank" + index] !== int) {
        this.rankArr["rank" + index] = int;
      } else {
        this.rankArr["rank" + index] = null;
        const checkboxes = document.getElementsByName(index.toString());
        for (let i = 0, n = checkboxes.length; i < n; i++) {
          if (checkboxes[i].value === int) {
            checkboxes[i].checked = false;
          }
        }
      }
    },
    async createGroup() {
      const filePath = `files/DefaultProfilePic/default-group.png`;
      const storageRef = await projectStorage.ref(filePath);
      const url = await storageRef.getDownloadURL();
      console.log(this.rankArr);
      const arr = this.groupName.toLowerCase().split("");
      const searchableIndex = [];
      let prevKey = "";
      for (const char of arr) {
        const key = prevKey + char;
        searchableIndex.push(key);
        prevKey = key;
      }
      projectFirestore
        .collection("groups")
        .add({
          name: this.groupName,
          ranks: this.rankArr,
          createdAt: timestamp(),
          searchableIndex: searchableIndex,
          photoUrl: url,
        })
        .then((res) => {
          projectFirestore
            .collection("groups")
            .doc(res.id)
            .collection("members")
            .doc(this.$store.getters.getUser.uid)
            .set({
              rank: "creator",
              joinDate: timestamp(),
            })
            .then(() => {
              console.log(this.$store.getters.getUser.uid);
              projectFirestore
                .collection("user")
                .doc(this.$store.getters.getUser.uid)
                .collection("groups")
                .doc(res.id)
                .set({
                  rank: "creator",
                  joinDate: timestamp(),
                });
            })
            .then(() => {
              this.groupName = "";
              this.rankNumber = null;
              location.reload();
            });
          // const splitArr = this.groupName.split(" ");
          // splitArr.forEach((word) => {
          //   projectFirestore
          //     .collection("searchGroup")
          //     .doc(word)
          //     .get()
          //     .then((response) => {
          //       if (!response.exists) {
          //         projectFirestore
          //           .collection("searchGroup")
          //           .doc(word)
          //           .set({ groups: [res.id] });
          //       } else {
          //         projectFirestore
          //           .collection("searchGroup")
          //           .doc(word)
          //           .update({ groups: [...response.data().users, res.id] });
          //       }
          //     });
          // });
        });
    },
    reloadList(e) {
      this.userGroups = this.userGroups.filter(({ id }) => !id.includes(e));
    },
  },
  created() {
    projectFirestore
      .collection("user")
      .doc(this.$store.getters.getUser.uid)
      .collection("groups")
      .get()
      .then((res) => {
        for (let i = 0; i < res.docs.length; i++) {
          if (res.docs[i].data().rank >= 5) {
            this.userGroups.unshift({
              ...res.docs[i].data(),
              id: res.docs[i].id,
            });
          } else {
            this.userGroups.push({ ...res.docs[i].data(), id: res.docs[i].id });
          }
        }
      });
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
.main-1 {
  display: flex;
  flex-direction: column;
  height: 89vh;
  .group-list {
    background: #444;
    color: white;
    height: 50%;
    margin: 0;
    h2 {
      margin: 0;
      color: white;
      background: $color6;
      padding: 1rem;
      padding-left: 2rem;
    }
    ul {
      margin: 0;
      padding: 0;
      li {
        padding: 1rem;
        border-bottom: 2px solid #555;
        &:hover {
          background: black;
        }
      }
    }
  }
  .new-group {
    // overflow-y: hidden;
    overflow-x: hidden;
    height: 50%;
    flex-grow: 1;
    margin-left: 20px;
    label[for="name"],
    label[for="rankNum"] {
      display: block;
      padding-top: 1rem;
      padding-bottom: 0.5rem;
      h3 {
        padding: 0;
        margin: 0;
      }
    }
    input[type="text"],
    input[type="number"] {
      font-size: 1rem;
      border: none;
      padding: 0.2rem;
      border: 2px solid white;
    }
    input[type="text"] {
      width: 40%;
      min-width: 300px;
    }
    input[type="text"]:focus,
    input[type="number"]:focus {
      outline: none;
      border: 2px solid $color6;
    }
    ul {
      li {
        position: relative;
        p {
          font-size: 0.75rem;
        }
        h3 {
          padding-top: 0.2rem;
          padding-bottom: 0;
          margin-bottom: 0.5rem;
        }
        .radio {
          display: inline-flex;
          cursor: pointer;
          position: relative;
          vertical-align: top;
          input {
            margin: 0;
            height: 1.25rem;
            width: 1.25rem;
            -webkit-appearance: none;
            -moz-appearance: none;
            -o-appearance: none;
            appearance: none;
            outline: none;
            background-color: white;
            cursor: pointer;

            &:checked {
              background-color: $color6;
            }
          }
          input:checked + span::before {
            content: "\2714";
            display: block;
            text-align: center;
            color: white;
            position: absolute;
            left: 0.22rem;
            top: -0.05rem;
          }
        }
        .label {
          cursor: help;
          position: relative;
          padding-right: 0.5rem;
          padding-left: 0.25rem;
          .tooltip {
            visibility: hidden;
            width: 120px;
            background-color: black;
            color: #fff;
            text-align: center;
            padding: 0.5rem;
            position: absolute;
            z-index: 1;
            opacity: 0;
            transition: visibility 0.1s linear, opacity 0.1s linear;
          }
          &:hover .tooltip {
            visibility: visible;
            opacity: 1;
            transition: visibility 0.75s linear, opacity 0.75s linear;
            transition-delay: 1s;
          }
        }
      }
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
  }
}
</style>
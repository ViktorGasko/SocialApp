<template>
  <div class="container">
    <div id="textarea-body">
      <textarea
        data-expandable
        id="textarea"
        placeholder="Write new post..."
        v-on:keydown="textAreaHeight"
        v-on:click="textAreaHeight"
        v-model.trim="text"
        v-on:keydown.enter.exact.prevent="newPost"
        rows="1"
        style="width: 100%"
      ></textarea>
      <div id="textarea-div" style="height: auto">XXX{{ text }}</div>
    </div>
    <div class="btn-c">
      <h3>Add</h3>
      <label for="img"
        ><font-awesome-icon icon="file-image"></font-awesome-icon
      ></label>
      <input
        type="file"
        id="img"
        name="files[]"
        multiple
        @change="checkPicture"
      />
      <button class="post" @click="newPost">Post</button>
      <div class="images">
        <div class="single-img" v-for="pic in picturesUrl" :key="pic">
          <button @click="removeImage(pic)">
            <p>
              <font-awesome-icon icon="times" />
            </p>
          </button>
          <img :src="pic" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { projectStorage } from "../firebase/config.js";
import { timestamp } from "@/firebase/config";
import { projectFirestore } from "../firebase/config";
import { v1 } from "uuid";

export default {
  props: ["groupId", "userId"],
  data() {
    return {
      text: "",
      pictures: [],
      picturesUrl: [],
    };
  },
  methods: {
    removeImage(pic) {
      const index = this.picturesUrl.findIndex((value) => value === pic);
      this.picturesUrl.splice(index, 1);
      this.pictures.splice(index, 1);
    },
    checkPicture(e) {
      this.$store.dispatch("checkPicture", e.target.files[0]).then((res) => {
        if (res.file !== null) {
          this.pictures.push(res.file);
          this.picturesUrl.push(res.previewPicUrl);
        }
      });
    },
    async newPost() {
      if (this.pictures.length > 0 || this.text.length > 0) {
        try {
          let url = "";
          let path = "";
          if (this.pictures.length > 0) {
            if (this.$props.groupId === "") {
              path = `files/${this.$props.userId}/posts/${v1()}`;
            } else {
              path = `files/${this.$props.groupId}/posts/${v1()}`;
            }
            const storageRef = projectStorage.ref(path);
            const res = await storageRef.put(this.pictures[0]);
            url = await res.ref.getDownloadURL();
          }
          const time = timestamp();
          if (this.$props.groupId === "") {
            await projectFirestore
              .collection("user")
              .doc(this.$props.userId)
              .collection("posts")
              .add({
                userId: this.$props.userId,
                timestamp: time,
                text: this.text,
                url: url,
              })
              .then((postResponse) => {
                projectFirestore
                  .collection("user")
                  .doc(this.$props.userId)
                  .collection("followers")
                  .get()
                  .then((followersResponse) => {
                    followersResponse.forEach((follower) => {
                      projectFirestore
                        .collection("user")
                        .doc(follower.id)
                        .collection("newsFeed")
                        .doc(postResponse.id)
                        .set({
                          group: false,
                          id: this.$props.userId,
                          timestamp: time,
                        });
                    });
                  });
                projectFirestore
                  .collection("user")
                  .doc(this.$props.userId)
                  .collection("newsFeed")
                  .doc(postResponse.id)
                  .set({
                    group: false,
                    id: this.$props.userId,
                    timestamp: time,
                  });
                this.$emit("newPost", {
                  userId: this.$props.userId,
                  postId: postResponse.id,
                  timestamp: { seconds: Date.now() / 1000 },
                  text: this.text,
                  url: url,
                });
              });
          } else {
            await projectFirestore
              .collection("groups")
              .doc(this.$props.groupId)
              .collection("posts")
              .add({
                userId: this.$props.userId,
                timestamp: time,
                text: this.text,
                url: url,
              })
              .then((postResponse) => {
                projectFirestore
                  .collection("groups")
                  .doc(this.$props.groupId)
                  .collection("members")
                  .get()
                  .then((membersResponse) => {
                    membersResponse.forEach((member) => {
                      projectFirestore
                        .collection("user")
                        .doc(member.id)
                        .collection("newsFeed")
                        .doc(postResponse.id)
                        .set({
                          id: this.$props.groupId,
                          group: true,
                          timestamp: time,
                        });
                    });
                  });
                this.$emit("newPost", {
                  userId: this.$props.userId,
                  postId: postResponse.id,
                  timestamp: { seconds: Date.now() / 1000 },
                  text: this.text,
                  url: url,
                });
              });
          }
        } catch (err) {
          console.log(err);
        }
        this.text = "";
        this.pictures = [];
        this.picturesUrl = [];
      }
    },
    textAreaHeight() {
      const el = document.getElementById("textarea");
      const div = document.getElementById("textarea-div");
      const textareaWrap = document.getElementById("textarea-body");
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
  .btn-c {
    position: relative;
    width: 80%;
    align-items: center;
    input {
      visibility: none;
      display: none;
    }
    h3 {
      display: inline-block;
      font-size: 1.25rem;
      padding-right: 25px;
      padding: 5px 25px 5px 0;
    }
    label {
      &:hover {
        cursor: pointer;
      }
      display: inline-block;
      svg {
        font-size: 2rem;
        color: $color6;
      }
    }
    .post {
      background: $color6;
      color: $color2;
      padding: 5px 15px;
      font-size: 1.25rem;
      float: right;
      margin-top: 1.25rem;
    }
    .images {
      .single-img {
        position: relative;
        margin-right: 0.75rem;
        display: inline-block;
        img {
          object-fit: cover;
          height: 120px;
          width: 120px;
        }
        button {
          background: #555;
          border-bottom-left-radius: 30%;
          position: absolute;
          top: 0;
          right: 0;
          padding: 0 5px;
          p {
            color: white;
            margin: 0;
            padding: 5px 3px;
          }
        }
      }
    }
  }
  #textarea-body {
    height: 39px;
    width: 80%;
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
    #textarea-div {
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
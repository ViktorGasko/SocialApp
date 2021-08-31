<template>
  <div class="container">
    <div class="photo-container">
      <div class="img-bar">
        <button @click="closePic">
          <p>
            <font-awesome-icon icon="times" />
          </p>
        </button>
      </div>
      <img :src="photoUrl" alt="" />
    </div>
    <div class="sidebar">ahoj</div>
  </div>
</template>

<script>
import { projectFirestore } from "../firebase/config";

export default {
  props: ["picId"],
  data() {
    return {
      photoQuery: null,
      id: this.$props.picId,
      photoUrl: null,
    };
  },
  created() {
    if (this.$route.query.type) {
      this.photoQuery = this.$route.query.type;
      if (this.photoQuery === "profilePic") {
        projectFirestore
          .collection("user")
          .doc(this.id)
          .get()
          .then((doc) => {
            this.photoUrl = doc.data().photoUrl;
          });
      }
    }
  },
  methods: {
    closePic() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
.container {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  .photo-container {
    background: black;
    flex: 80%;
    height: 100vh;
    position: relative;
    .img-bar {
      width: 100%;
      // background: black; -- set to rgba
      height: 10vh;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
      button {
        margin-left: 2vw;
        background: none;
        border: none;
        svg {
          font-size: 2.5rem;
          color: $color2;
        }
      }
    }
    img {
      object-fit: cover;
      display: block;
      max-height: 100%;
      max-width: 90%;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
    }
  }
  .sidebar {
    flex: 20%;
    background: rgba($color: black, $alpha: 1);
  }
}
</style>
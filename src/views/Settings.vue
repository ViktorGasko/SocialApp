<template>
  <div class="container">
    <h2>Change Profile Picture</h2>
    <div class="img">
      <button v-if="showDelete" @click="removeProfilePicture">
        <p>
          <font-awesome-icon icon="times" />
        </p>
      </button>
      <img :src="picUrl" alt="" />
    </div>
    <label for="img"
      ><font-awesome-icon icon="file-image"></font-awesome-icon> Choose
      Picture</label
    >
    <input
      class="img-input"
      type="file"
      id="img"
      name="files[]"
      multiple
      @change="checkPicture"
    />
    <button @click="addProfilePicture">Set Picture</button>
    <h2>Change Display Name</h2>
    <input type="text" :placeholder="user.displayName" v-model="displayName" />
    <button @click="changeDisplayName">Set New Name</button>
    <h2>Delete Account</h2>
    <button @click="showConfirm">Delete Account</button>
    <confirm
      v-if="confirmVisible"
      :text="'Do you really want to delete Account?'"
      @clicked="deleteAccount"
    />
  </div>
</template>

<script>
import Confirm from "../components/Confirm.vue";
export default {
  components: {
    Confirm,
  },
  data() {
    return {
      user: this.$store.getters.getUser,
      picture: null,
      currentPic: "",
      displayName: "",
      confirmVisible: false,
      url: "",
      previewPicUrl: "",
    };
  },
  created() {
    this.url = this.user.photoURL;
  },
  computed: {
    picUrl() {
      return this.previewPicUrl ? this.previewPicUrl : this.url;
    },
    showDelete() {
      return (
        this.picUrl !==
        "https://firebasestorage.googleapis.com/v0/b/vue-http-demo-46312.appspot.com/o/files%2FDefaultProfilePic%2Fdefault.png?alt=media&token=13cec218-34f9-4e0b-b2a2-573cfc576bc5"
      );
    },
  },
  methods: {
    showConfirm() {
      this.confirmVisible = true;
    },
    deleteAccount(e) {
      if (e === false) {
        this.confirmVisible = false;
      } else {
        //
      }
    },
    changeDisplayName() {},
    async addProfilePicture() {
      await this.$store.dispatch("addProfilePic", {
        user: this.user,
        picture: this.picture,
      });
      this.url = this.user.photoURL;
      this.previewPicUrl = "";
      this.picture = null;
    },
    async removeProfilePicture() {
      if (this.previewPicUrl) {
        this.previewPicUrl = "";
        this.picture = null;
      } else {
        await this.$store.dispatch("removeProfilePicture", {
          user: this.user,
        });
        this.url = this.user.photoURL;
      }
    },
    checkPicture(e) {
      const file = e.target.files[0];
      if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
        Object.defineProperty(file, "name", {
          writable: true,
          value: "profilePic",
        });
        this.picture = file;
        this.previewPicUrl = URL.createObjectURL(file);
      } else if (file) {
        console.log("Choose file of type .png or .jpeg");
        this.picture = null;
        this.previewPicUrl = null;
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";
.container {
  margin: 20px;
  h2 {
    margin-top: 25px;
  }
  .img {
    position: relative;
    margin-bottom: 20px;
    height: 120px;
    width: 120px;
    img {
      border: 1px solid $color6;
      width: inherit;
      height: inherit;
      object-fit: cover;
    }
    display: block;
    button {
      background: $color6;
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
  .img-input {
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
    margin-right: 20px;
    font-weight: bold;
    &:hover {
      cursor: pointer;
    }
    display: inline-block;
    svg {
      font-size: 2rem;
      color: $color6;
    }
  }
  button {
    background: $color6;
    border: none;
    padding: 10px 15px;
    color: white;
    font-size: 1rem;
    &:hover {
      opacity: 0.9;
    }
  }
  input[type="text"] {
    border: 2px solid white;
    padding: 8px 15px;
    width: 30%;
    font-size: 1rem;
    &:focus {
      border: 2px solid $color6;
      outline: none;
    }
  }
}
</style>
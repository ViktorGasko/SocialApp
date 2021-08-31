<template></template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return { picture: null, picUrl: null };
  },
  methods: {
    async addProfilePicture() {
      await this.$store.dispatch("addProfilePic", {
        user: this.$store.getters.getUser,
        picture: this.picture,
      });
    },
    async removeProfilePicture() {
      await this.$store.dispatch("removeProfilePicture", {
        user: this.$store.getters.getUser,
      });
    },
    addPicture(e) {
      const file = e.target.files[0];
      if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
        Object.defineProperty(file, "name", {
          writable: true,
          value: "profilePic",
        });
        this.picture = file;
      } else if (file) {
        console.log("Choose file of type .png or .jpeg");
      }
    },
  },
};
</script>

<style>
</style>
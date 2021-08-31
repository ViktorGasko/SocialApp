<template>
  <div class="container">
    <div class="body">
      <div class="text">
        <h3>{{ text }}</h3>
      </div>
      <button @click="clicked(true)" class="btn-1">Confirm</button
      ><button @click="clicked(false)" class="btn-2">Close</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["text"],
  methods: {
    clicked(value) {
      this.$emit("clicked", value);
    },
  },
};
</script>

<style scoped lang='scss'>
@import "../scss/_variables.scss";

.container {
  position: fixed;
  padding: 0;
  margin: 0;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 10;
  .body {
    position: absolute;
    top: 0;
    bottom: 20vh;
    left: 0;
    right: 0;
    margin: auto;
    width: 400px;
    height: 300px;
    background: white;
    z-index: 12;
    color: black;
    .text {
      position: relative;
      height: 200px;
      margin: 1rem;
      h3 {
        word-wrap: break-word;
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        margin: auto;
      }
    }
    button {
      position: relative;
      padding: 0.5rem 1.5rem;
      font-size: 1rem;
      margin-top: 0.75rem;
      color: white;
      background: $color6;
    }
    .btn-1 {
      float: left;
      margin-left: 1rem;
    }
    .btn-2 {
      float: right;
      margin-right: 1rem;
    }
  }
}
</style>
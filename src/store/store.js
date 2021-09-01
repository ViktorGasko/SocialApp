import { createStore } from "vuex";
import User from "./user.js";
import profilePicture from "./profilePicture.js";
import checkPicture from "./checkPicture.js";
import loadPosts from "./loadPosts.js";

const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: { User, profilePicture, checkPicture, loadPosts },
});

export default store;

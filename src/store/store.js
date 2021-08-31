import { createStore } from "vuex";
import User from "./user.js";
import Search from "./search.js";
import UserDetails from "./userDetails.js";

const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: { User, UserDetails, Search },
});

export default store;

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store/store.js";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import InstantSearch from "vue-instantsearch";

import { projectAuth } from "./firebase/config";

library.add(fas);

let app;

projectAuth.onAuthStateChanged((_user) => {
  store.commit("setUser", _user);
  if (!app) {
    app = createApp(App)
      .component("font-awesome-icon", FontAwesomeIcon)
      .use(router)
      .use(store)
      .use(InstantSearch)
      .mount("#app");
  }
});

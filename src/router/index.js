import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Profile from "../views/Profile.vue";
import NewsFeed from "../views/NewsFeed.vue";
import Group from "../views/Group.vue";
import Settings from "../views/Settings.vue";
import Results from "../views/Results.vue";
import GroupSettings from "../views/GroupSettings.vue";
import MyGroups from "../views/MyGroups.vue";

import Picture from "../views/Picture.vue";

import { projectAuth } from "../firebase/config";
import { projectFirestore } from "../firebase/config";

const requireAuth = (_to, _from, next) => {
  let user = projectAuth.currentUser;
  if (!user) {
    next({ name: "Login" });
  } else {
    next();
  }
};
const requireMembership = (_to, _from, next) => {
  console.log("b");
  projectFirestore
    .collection("userPublic")
    .doc(projectAuth.currentUser.uid)
    .collection("groups")
    .doc(_to.params.id)
    .get()
    .then((res) => {
      if (res.exists) {
        next();
      } else {
        next({ name: "Group" });
      }
    });
};

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    beforeEnter: requireAuth,
    children: [
      {
        path: "",
        component: NewsFeed,
      },
      {
        path: "profile/:id",
        name: "Profile",
        component: Profile,
        props: true,
      },
      {
        path: "group/:id",
        name: "Group",
        component: Group,
        props: true,
      },
      {
        path: "group/:id/groupsettings",
        name: "GroupSettings",
        props: true,
        component: GroupSettings,
        beforeEnter: requireMembership,
      },
      {
        path: "settings",
        name: "Settings",
        component: Settings,
        beforeEnter: requireAuth,
      },
      {
        path: "results",
        name: "Results",
        component: Results,
        beforeEnter: requireAuth,
      },
      {
        path: "groups",
        name: "MyGroups",
        component: MyGroups,
        beforeEnter: requireAuth,
      },
      {
        path: ":picId",
        name: "Picture",
        component: Picture,
        props: true,
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  // {
  //   path: "/profile/:id",
  //   name: "Profile",
  //   component: Profile,
  //   props: true,
  // },
  // {
  //   path: "/group/:id",
  //   name: "Group",
  //   component: Group,
  //   props: true,
  // },
  // {
  //   path: "/group/:id/groupsettings",
  //   name: "GroupSettings",
  //   props: true,
  //   component: GroupSettings,
  //   beforeEnter: requireMembership,
  // },

  // {
  //   path: "/settings",
  //   name: "Settings",
  //   component: Settings,
  //   beforeEnter: requireAuth,
  // },
  // {
  //   path: "/groups",
  //   name: "MyGroups",
  //   component: MyGroups,
  //   beforeEnter: requireAuth,
  // },
  // {
  //   path: "/:picId",
  //   name: "Picture",
  //   component: Picture,
  //   props: true,
  // },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;

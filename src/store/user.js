import { projectAuth } from "../firebase/config";
import { timestamp } from "@/firebase/config";
import { projectFirestore } from "../firebase/config";
import { projectStorage } from "../firebase/config.js";

export default {
  state() {
    return {
      user: null,
    };
  },
  getters: {
    getUser(state) {
      return state.user;
    },
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
  },
  actions: {
    async login(_context, payload) {
      try {
        const res = await projectAuth.signInWithEmailAndPassword(
          payload.email,
          payload.password
        );
        return { ok: true, response: res };
      } catch (err) {
        console.log(err.message);
        return { ok: false, response: err };
      }
    },
    async signup(_context, payload) {
      try {
        const res = await projectAuth.createUserWithEmailAndPassword(
          payload.email,
          payload.password
        );
        if (!res) {
          throw new Error("Could not complete signup");
        }
        const filePath = `files/DefaultProfilePic/default.png`;
        const storageRef = await projectStorage.ref(filePath);
        const url = await storageRef.getDownloadURL();
        await res.user.updateProfile({
          displayName: payload.displayName,
          photoURL: url,
        });

        const arr = payload.displayName.toLowerCase().split("");
        const searchableIndex = [];
        let prevKey = "";
        for (const char of arr) {
          const key = prevKey + char;
          searchableIndex.push(key);
          prevKey = key;
        }
        await projectFirestore
          .collection("user")
          .doc(res.user.uid)
          .set({
            createdAt: timestamp(),
            photoUrl: url,
            displayName: payload.displayName,
            online: false,
            searchableIndex: searchableIndex,
          });
        return { ok: true, response: res };
      } catch (err) {
        console.log(err.message);
        return { ok: false, response: err };
      }
    },
    async logout(context) {
      try {
        await projectAuth.signOut();
        context.commit("setUser", null);
      } catch (err) {
        console.log(err.message);
        return { ok: false, response: err };
      }
      return { ok: true };
    },
  },
};

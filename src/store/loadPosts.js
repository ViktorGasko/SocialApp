import { projectFirestore } from "../firebase/config";

export default {
  state: {},
  mutations: {},
  actions: {
    async loadDefault(_context, payload) {
      const postArray = [];
      await projectFirestore
        .collection(payload.type)
        .doc(payload.id)
        .collection("posts")
        .orderBy("timestamp", "desc")
        .limit(10)
        .get()
        .then((posts) => {
          posts.forEach((post) => {
            postArray.push({ ...post.data(), postId: post.id });
          });
        });
      return postArray;
    },
    async loadAdditional(_context, payload) {
      const postArray = [];
      await projectFirestore
        .collection(payload.type)
        .doc(payload.id)
        .collection("posts")
        .where("timestamp", "<", payload.timestamp)
        .orderBy("timestamp", "desc")
        .limit(10)
        .get()
        .then((posts) => {
          posts.forEach((post) => {
            postArray.push({ ...post.data(), postId: post.id });
          });
        });
      return postArray;
    },
  },
};

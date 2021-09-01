import { projectStorage } from "../firebase/config.js";
import { projectFirestore } from "../firebase/config";

export default {
  state: {},
  mutations: {},
  actions: {
    async addProfilePic(_context, payload) {
      const filePath = `files/${payload.user.uid}/profilePic`;
      const storageRef = projectStorage.ref(filePath);
      try {
        const res = await storageRef.put(payload.picture);
        const url = await res.ref.getDownloadURL();
        await payload.user.updateProfile({ photoURL: url });
        await projectFirestore
          .collection("user")
          .doc(payload.user.uid)
          .update({
            photoUrl: url,
          });
        console.log(url);
      } catch (err) {
        console.log(err.message);
      }
    },
    async removeProfilePicture(_context, payload) {
      let storageRef = await projectStorage.ref(
        `files/${payload.user.uid}/profilePic`
      );
      try {
        await storageRef.delete();
        const filePath = `files/DefaultProfilePic/default.png`;
        storageRef = await projectStorage.ref(filePath);
        const url = await storageRef.getDownloadURL();
        await payload.user.updateProfile({ photoURL: url });
        console.log(url);
        await projectFirestore
          .collection("user")
          .doc(payload.user.uid)
          .update({
            photoUrl: url,
          });
      } catch (err) {
        console.log(err);
      }
    },
  },
};

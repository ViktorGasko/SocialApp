export default {
  state: {},
  mutations: {},
  actions: {
    checkPicture(_context, payload) {
      const file = payload;
      if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
        Object.defineProperty(file, "name", {
          writable: true,
          value: "profilePic",
        });
        return { picture: file, previewPicUrl: URL.createObjectURL(file) };
      } else if (file) {
        console.log("Choose file of type .png or .jpeg");
        return { picture: null, previewPicUrl: null };
      }
    },
  },
};

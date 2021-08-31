import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAaFj15KgZlOIZjdjWTm1zQbS8Bc9ty5T0",
  authDomain: "vue-http-demo-46312.firebaseapp.com",
  databaseURL:
    "https://vue-http-demo-46312-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vue-http-demo-46312",
  storageBucket: "vue-http-demo-46312.appspot.com",
  messagingSenderId: "214751459450",
  appId: "1:214751459450:web:573e06241fe71c374de3c3",
};

firebase.initializeApp(firebaseConfig);
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();
const projectStorage = firebase.storage();
const FieldValue = firebase.firestore.FieldValue;

const timestamp = firebase.firestore.FieldValue.serverTimestamp;
const timeNow = firebase.firestore.Timestamp;
export {
  projectAuth,
  projectFirestore,
  timestamp,
  projectStorage,
  FieldValue,
  timeNow,
};

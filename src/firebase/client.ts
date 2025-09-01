
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBh9pc28IU98P3l1nIYml4l2nmNOjwgPsc",
  authDomain: "fitness-compass-oj9x8.firebaseapp.com",
  projectId: "fitness-compass-oj9x8",
  storageBucket: "fitness-compass-oj9x8.firebasestorage.app",
  messagingSenderId: "552955739663",
  appId: "1:552955739663:web:eab0830990efc8d8fbed7a",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "fitness-compass-oj9x8",
  "appId": "1:552955739663:web:eab0830990efc8d8fbed7a",
  "storageBucket": "fitness-compass-oj9x8.firebasestorage.app",
  "apiKey": "AIzaSyBh9pc28IU98P3l1nIYml4l2nmNOjwgPsc",
  "authDomain": "fitness-compass-oj9x8.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "552955739663"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };

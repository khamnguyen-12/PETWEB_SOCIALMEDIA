// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCfsRK0YKygP8qNBg7A-ybMoDEjLNwURec",
  authDomain: "petweb-501a9.firebaseapp.com",
  projectId: "petweb-501a9",
  storageBucket: "petweb-501a9.appspot.com",
  messagingSenderId: "550883112061",
  appId: "1:550883112061:web:2e5da08e54beea50fd6d14",
  measurementId: "G-VJC7DC16S3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export {app, auth};
// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/compat/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDV4VfhUbo359F6cXmCKS-1e_47nlpnkSA",
  authDomain: "calendar-a2b7f.firebaseapp.com",
  projectId: "calendar-a2b7f",
  storageBucket: "calendar-a2b7f.appspot.com",
  messagingSenderId: "503935894078",
  appId: "1:503935894078:web:59efffae4827dcd638876f",
  measurementId: "G-75KP20Q8WF"
};

// Initialize Firebase
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig)
}
/*const analytics = getAnalytics(app);*/
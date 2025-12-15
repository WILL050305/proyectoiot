// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQfLe1P85eO0nIZOFPx-J5KmYu_qR26jI",
  authDomain: "iotb2-6aafe.firebaseapp.com",
  databaseURL: "https://iotb2-6aafe-default-rtdb.firebaseio.com",
  projectId: "iotb2-6aafe",
  storageBucket: "iotb2-6aafe.firebasestorage.app",
  messagingSenderId: "158885364768",
  appId: "1:158885364768:web:3876d4c840a2acf9d56845",
  measurementId: "G-HWM736Y99J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, database, db, auth };

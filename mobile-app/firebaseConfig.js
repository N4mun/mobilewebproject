import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyArjvIGnhnDlVRr8yywO1rjPYdEfP15SZc",
    authDomain: "mobilewebproject-d0fd9.firebaseapp.com",
    projectId: "mobilewebproject-d0fd9",
    storageBucket: "mobilewebproject-d0fd9.firebasestorage.app",
    messagingSenderId: "26492176474",
    appId: "1:26492176474:web:6d241c4a3b89a950767063",
    measurementId: "G-8QLCV36QGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

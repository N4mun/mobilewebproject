// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
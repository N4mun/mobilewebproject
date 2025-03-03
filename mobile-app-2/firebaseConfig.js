import { initializeApp, getApps, getApp } from "firebase/app"; // เพิ่ม getApps, getApp
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyArjvIGnhnDlVRr8yywO1rjPYdEfP15SZc",
    authDomain: "mobilewebproject-d0fd9.firebaseapp.com",
    projectId: "mobilewebproject-d0fd9",
    storageBucket: "mobilewebproject-d0fd9.firebasestorage.app",
    messagingSenderId: "26492176474",
    appId: "1:26492176474:android:959f05c14a2cffdf767063",
    measurementId: "G-8QLCV36QGQ"
};

// ตรวจสอบว่า Firebase App ถูกเริ่มต้นแล้วหรือยัง
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
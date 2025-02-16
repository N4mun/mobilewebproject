import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyArjv...",
    authDomain: "mobilewebproject-d0fd9.firebaseapp.com",
    projectId: "mobilewebproject-d0fd9",
    storageBucket: "mobilewebproject-d0fd9.appspot.com",
    messagingSenderId: "26492176474",
    appId: "1:26492176474:web:6d241c4a3b89a950767063",
    measurementId: "G-8QLCV36QGQ"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});d
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const GOOGLE_AUTH_PROVIDER = new GoogleAuthProvider();

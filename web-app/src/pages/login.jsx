import React from "react";
import { Button } from "@mui/material";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // อ้างอิงไปยัง Firestore ที่ users/{uid}
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            // ถ้ายังไม่มีข้อมูลผู้ใช้ใน Firestore ให้สร้างใหม่
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL,
                    status: 1,
                    classroom: {}, // ให้เป็น Object ว่างไว้ก่อน
                });
            }

            navigate("/dashboard"); // ไปที่หน้าหลักหลังจาก login
        } catch (error) {
            console.error("Login failed: ", error);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Login</h1>
            <Button variant="contained" color="primary" onClick={handleLogin}>
                Sign in with Google
            </Button>
        </div>
    );
};

export default Login;

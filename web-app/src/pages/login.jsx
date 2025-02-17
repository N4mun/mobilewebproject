import React from "react";
import { Button, Card, Typography, Container, Box } from "@mui/material";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    name: user.displayName,
                    email: user.email,
                    photo: user.photoURL,
                    status: 1,
                    classroom: {},
                });
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed: ", error);
        }
    };

    return (
        <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "50px" }}>
            <Card elevation={3} style={{ padding: "40px", borderRadius: "10px" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    ระบบจัดการห้องเรียน
                </Typography>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                    ลงชื่อเข้าใช้เพื่อจัดการห้องเรียนของคุณ
                </Typography>
                <Box mt={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLogin}
                        style={{ padding: "10px 20px", fontSize: "16px" }}
                    >
                        Sign in with Google
                    </Button>
                </Box>
            </Card>
        </Container>
    );
};

export default Login;

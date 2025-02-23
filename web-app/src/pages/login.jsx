import React from "react";
import { Button, Card, Typography, Container, Box } from "@mui/material";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import 'animate.css';

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
                });
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed: ", error);
        }
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <Card
                elevation={3}
                sx={{
                    backgroundColor: "#19a05e",
                    padding: 4,
                    borderRadius: 2,
                    border: "4px solid #fbc02d",
                    textAlign: "center",
                    width: "100%",
                    maxWidth: 400,
                    boxShadow: "0px 4px 10px rgba(1, 1, 1, 0.5)",
                    "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.4)",
                    }
                }}
            >


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
                        sx={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            transition: "0.3s",
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
                            "&:hover": {
                                color:"green",    
                                backgroundColor: "#FFFFFF",
                                transform: "scale(1.05)",
                                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.4)",
                            }
                        }}
                    >
                        Sign in with Google
                    </Button>

                </Box>
            </Card>
            
        </Container>
        
    );
};

export default Login;

import React from "react";
import { Button, Card, Typography, Container, Box } from "@mui/material";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import 'animate.css';
import { FcGoogle } from "react-icons/fc"; // เพิ่มไอคอน Google จาก react-icons

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
                });
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed: ", error);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", // Gradient พื้นหลัง
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* เพิ่มวงกลมตกแต่งพื้นหลัง */}
            <Box
                sx={{
                    position: "absolute",
                    top: "-100px",
                    left: "-100px",
                    width: "300px",
                    height: "300px",
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                    animation: "float 6s ease-in-out infinite",
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    bottom: "-150px",
                    right: "-150px",
                    width: "400px",
                    height: "400px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "50%",
                    animation: "float 8s ease-in-out infinite",
                }}
            />

            <Container maxWidth="xs">
                <Card
                    elevation={10}
                    className="animate__animated animate__fadeInUp"
                    sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)", // พื้นหลังกึ่งโปร่งใส
                        padding: { xs: 3, sm: 4 },
                        borderRadius: 3,
                        textAlign: "center",
                        maxWidth: 400,
                        boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                            transform: "translateY(-5px)",
                            boxShadow: "0px 12px 30px rgba(0, 0, 0, 0.25)",
                        },
                    }}
                >
                    <Typography
                        variant="h4"
                        fontWeight="700"
                        sx={{
                            color: "#1e3c72",
                            mb: 1,
                            fontFamily: "'Poppins', sans-serif",
                        }}
                    >
                        ยินดีต้อนรับ
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: "#555",
                            mb: 4,
                            fontFamily: "'Roboto', sans-serif",
                            fontSize: "1.1rem",
                        }}
                    >
                        ลงชื่อเข้าใช้เพื่อจัดการห้องเรียนของคุณ
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleLogin}
                        startIcon={<FcGoogle size={24} />}
                        sx={{
                            backgroundColor: "#ffffff",
                            color: "#333",
                            padding: "12px 24px",
                            borderRadius: "25px",
                            fontSize: "1rem",
                            fontWeight: "600",
                            textTransform: "none",
                            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
                            border: "1px solid #ddd",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                backgroundColor: "#f5f5f5",
                                transform: "scale(1.05)",
                                boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
                            },
                        }}
                    >
                        Sign in with Google
                    </Button>

                </Card>
            </Container>

            {/* เพิ่ม keyframes สำหรับอนิเมชันพื้นหลัง */}
            <style>
                {`
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                        100% { transform: translateY(0px); }
                    }
                `}
            </style>
        </Box>
    );
};

export default Login;
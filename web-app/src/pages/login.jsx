import React from "react";
import { Button } from "@mui/material";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        navigate("/dashboard");
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
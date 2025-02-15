import React from "react";
import { Button } from "@mui/material";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Welcome to Dashboard</h1>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
                Logout
            </Button>
        </div>
    );
};

export default Dashboard;
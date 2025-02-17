import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const PrivateRoute = ({ children }) => {
    const [user, loading] = useAuthState(auth);

    if (loading) {
        return <div>Loading...</div>; // ป้องกันเด้งไปหน้า Login ขณะโหลด
    }

    return user ? children : <Navigate to="/" />;
};

export default PrivateRoute;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  const [user] = useAuthState(auth);

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;

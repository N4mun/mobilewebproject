import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import EditProfile from "./pages/editprofile";
import AddClass from "./pages/addclass";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>; // ป้องกันหน้า Login โหลดก่อน Firebase
  }

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

      <Route
        path="/edit-profile"
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />

      <Route
        path="/add-class"
        element={
          <PrivateRoute>
            <AddClass />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;

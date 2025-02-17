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
  const [user] = useAuthState(auth);

  return (
    <Routes>
      {/* เปลี่ยน path="/" ให้ไปหน้า login โดยใช้ HashRouter */}
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

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

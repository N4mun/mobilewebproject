import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import EditProfile from "./pages/editprofile";
import AddClass from "./pages/addclass";
import Classroom from "./pages/classroom";
import Checkin from "./pages/checkin";
import PrivateRoute from "./components/PrivateRoute";
import Questions from "./pages/questions";

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

      <Route
        path="/classroom/:cid"
        element={
          <PrivateRoute>
            <Classroom />
          </PrivateRoute>
        }
      />

      <Route
        path="/checkin"
        element={
          <PrivateRoute>
            <Checkin />
          </PrivateRoute>
        }
      />

      <Route
        path="/questions"
        element={
          <PrivateRoute>
            <Questions />
          </PrivateRoute>
        }
      />

    </Routes>
  );
};

export default App;

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profilepage from "./pages/Profilepage";
import Navbar from "./components/Navbar";
import Onboarding from "./pages/Onboarding";
import Callpage from "./pages/Callpage";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "./libs/axios.js";

const App = () => {
  const { data: authdata, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        console.log("Auth Response:", res.data);
        return res.data;
      } catch (error) {
        console.error("Auth Error:", error);
        return { user: null };
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const authUser = authdata?.user || null;
  console.log("Auth State:", { isLoading, authUser });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar user={authUser}/>
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route
            path="/"
            element={authUser ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/signup"
            element={!authUser ? <Signup /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={authUser ? <Profilepage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/onboarding"
            element={authUser ? <Onboarding /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/call"
            element={authUser ? <Callpage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/notifications"
            element={authUser ? <Notifications /> : <Navigate to="/login" />}
          />
          <Route
            path="/chat/:id"
            element={authUser ? <Chat /> : <Navigate to="/login" />}
          />
        </Routes>
        <Toaster />
      </main>
    </div>
  );
};

export default App;

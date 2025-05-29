import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../libs/axios";
import { useQueryClient } from "@tanstack/react-query";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      // Invalidate and refetch auth status
      await queryClient.invalidateQueries(["authUser"]);
      // Reset auth query data
      queryClient.setQueryData(["authUser"], { user: null });
      // After successful logout, redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <nav className="bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 backdrop-blur-lg shadow-lg border-b border-purple-500/20">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link 
          to="/" 
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-400 hover:from-purple-300 hover:to-violet-300 transition-all duration-300"
        >
          Chattrix
        </Link>
        <div className="space-x-6">
          {user ? (
            <>
              <Link 
                to="/" 
                className="text-purple-200 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                Home
              </Link>
              <Link 
                to="/profile" 
                className="text-purple-200 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                Profile
              </Link>
              <Link 
                to="/notifications" 
                className="text-purple-200 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                Notifications
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-300 hover:text-red-200 transition-all duration-300 bg-red-900/20 px-4 py-1 rounded-lg border border-red-500/20 hover:bg-red-900/30"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-purple-200 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-purple-600 text-white px-4 py-1 rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 border border-purple-500/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

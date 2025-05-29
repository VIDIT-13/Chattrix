import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../libs/axios";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto backdrop-blur-lg bg-gray-900/60 rounded-2xl border border-purple-500/20 shadow-2xl overflow-hidden"
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-violet-900/50 px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-violet-500/10 backdrop-blur-3xl"></div>
          <div className="relative flex items-center space-x-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full blur-lg opacity-50"></div>
              <img
                src={user?.profilePicture || "/default-avatar.png"}
                alt={user?.name}
                className="relative w-32 h-32 rounded-full border-2 border-purple-500/50 shadow-lg object-cover"
              />
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-400">
                {user?.name}
              </h1>
              <p className="text-purple-200/80 mt-2">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-8">
          {/* Bio Section */}
          <div className="bg-gray-800/40 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-purple-300 mb-3">
              About Me
            </h2>
            <p className="text-gray-300">{user?.bio || "No bio added yet"}</p>
          </div>

          {/* Language Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/40 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
              <h3 className="text-lg font-medium text-purple-300 mb-2">
                Native Language
              </h3>
              <p className="text-violet-400 font-semibold">
                {user?.nativeLanguage || "Not specified"}
              </p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-6 backdrop-blur-sm border border-purple-500/20">
              <h3 className="text-lg font-medium text-purple-300 mb-2">
                Learning Language
              </h3>
              <p className="text-violet-400 font-semibold">
                {user?.learningLanguage || "Not specified"}
              </p>
            </div>
          </div>

          {/* Location and Other Details */}
          <div className="border-t border-purple-500/20 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/40 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-purple-300 mb-2">
                  Location
                </h3>
                <p className="text-gray-300">
                  {user?.location || "Not specified"}
                </p>
              </div>
              <div className="bg-gray-800/40 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-purple-300 mb-2">
                  Member Since
                </h3>
                <p className="text-gray-300">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="border-t pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-800">
                  Account Status
                </h3>
                <p className="text-gray-600">
                  {user?.onBoarded ? "Profile Complete" : "Profile Incomplete"}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-full ${
                  user?.onBoarded
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {user?.onBoarded ? "Active" : "Pending Setup"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;

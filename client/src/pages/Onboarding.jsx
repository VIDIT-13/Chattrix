import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Chinese",
  "Japanese",
  "Korean",
  "Russian",
  "Arabic",
  "Hindi",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState({
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    location: "",
    profilePicture: `https://api.dicebear.com/6.x/micah/svg?seed=${Math.random()}`,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5002/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          navigate("/login");
          return;
        }

        const data = await response.json();
        setCurrentUser(data.user);

        // Only initialize form data if user hasn't been onboarded
        if (!data.user.onBoarded) {
          setUserData({
            bio: data.user.bio || "",
            nativeLanguage: data.user.nativeLanguage || "",
            learningLanguage: data.user.learningLanguage || "",
            location: data.user.location || "",
            profilePicture: data.user.profilePicture || `https://api.dicebear.com/6.x/micah/svg?seed=${Math.random()}`,
          });
        } else {
          // If user is already onboarded, redirect to home
          navigate("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!userData.nativeLanguage || !userData.learningLanguage) {
      setError("Please select both native and learning languages");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5002/api/auth/onboarding",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...userData,
            onBoarded: true,
            userId: currentUser?.id, // Include the user ID in the request
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate("/");
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-gray-600">
          Tell us more about yourself to get started
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col items-center mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Avatar
            </label>
            <div className="relative group">
              <img
                src={userData.profilePicture}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-3"
              />
              <button
                type="button"
                onClick={() => setUserData({
                  ...userData,
                  profilePicture: `https://api.dicebear.com/6.x/micah/svg?seed=${Math.random()}`
                })}
                className="mt-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
              >
                Generate New Avatar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tell us about yourself..."
              value={userData.bio}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Native Language
              </label>
              <select
                name="nativeLanguage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={userData.nativeLanguage}
                onChange={handleChange}
              >
                <option value="">Select language</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language You're Learning
              </label>
              <select
                name="learningLanguage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={userData.learningLanguage}
                onChange={handleChange}
              >
                <option value="">Select language</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your location..."
              value={userData.location}
              onChange={handleChange}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Updating Profile..." : "Complete Profile"}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default Onboarding;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../libs/axios";

const UserCard = ({ user, isFriend, onAddFriend, onFriendClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 ${
      isFriend ? "cursor-pointer hover:bg-gray-50" : ""
    }`}
    onClick={() => isFriend && onFriendClick && onFriendClick(user)}
  >
    <img
      src={user.profilePicture}
      alt={user.name}
      className="w-16 h-16 rounded-full border-2 border-indigo-200"
    />
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
      <p className="text-sm text-gray-600">
        Speaks: {user.nativeLanguage} • Learning: {user.learningLanguage}
      </p>
      <p className="text-sm text-gray-500">{user.location}</p>
    </div>
    {!isFriend && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddFriend(user._id);
        }}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        Add Friend
      </button>
    )}
  </motion.div>
);

const Home = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleFriendClick = (friend) => {
    navigate(`/chat/${friend._id}`, { state: { friend } });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const userResponse = await axiosInstance.get("/auth/me");
        setCurrentUser(userResponse.data.user);

        // Fetch friends
        const friendsResponse = await axiosInstance.get("/users/friends");
        setFriends(friendsResponse.data.friends);

        // Fetch recommended users
        const recommendedResponse = await axiosInstance.get("/users");
        // Filter out the current user from recommended users
        const filteredUsers = recommendedResponse.data.users.filter(
          (user) => user._id !== userResponse.data.user._id
        );
        setRecommendedUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddFriend = async (userId) => {
    try {
      const response = await axiosInstance.post(
        `/users/friend-request/${userId}`
      );
      if (response.data.success) {
        // Remove user from recommended list after sending request
        setRecommendedUsers((prev) =>
          prev.filter((user) => user._id !== userId)
        );
        setError("");
      } else {
        setError(response.data.message || "Failed to send friend request");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      // Show the error message from the backend
      setError(
        error.response?.data?.message || "Failed to send friend request"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* User Profile Section */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <div className="flex items-center space-x-6">
            <img
              src={currentUser.profilePicture}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full border-4 border-indigo-200"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentUser.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Native: {currentUser.nativeLanguage} • Learning:{" "}
                {currentUser.learningLanguage}
              </p>
              <p className="text-gray-500 mt-1">{currentUser.location}</p>
              <p className="text-gray-700 mt-2">{currentUser.bio}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Friends Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-600">You haven't added any friends yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {friends.map((friend) => (
              <UserCard
                key={friend._id}
                user={friend}
                isFriend={true}
                onFriendClick={handleFriendClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recommended Users Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recommended Language Partners
        </h2>
        {recommendedUsers.length === 0 ? (
          <p className="text-gray-600">
            No recommendations available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedUsers.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                isFriend={false}
                onAddFriend={handleAddFriend}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

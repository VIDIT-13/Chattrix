import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../libs/axios";

const UserCard = ({ user, isFriend, onAddFriend, onFriendClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gray-900/60 backdrop-blur-lg rounded-xl shadow-xl p-6 flex items-center space-x-4 border border-purple-500/20 ${
      isFriend
        ? "cursor-pointer hover:bg-gray-800/70 transition-all duration-300"
        : ""
    }`}
    onClick={() => isFriend && onFriendClick && onFriendClick(user)}
  >
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full blur-lg opacity-50"></div>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 animate-pulse rounded-full bg-purple-800/50 z-10"></div>
        <img
          src={user.profilePicture}
          alt={user.name}
          className="absolute inset-0 w-full h-full rounded-full border-2 border-purple-500/50 shadow-lg object-cover z-20 transition-opacity duration-300"
          onLoad={(e) => {
            e.target.style.opacity = "1";
            e.target.previousSibling.style.display = "none";
          }}
          style={{ opacity: 0 }}
        />
      </div>
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-purple-100">{user.name}</h3>
      <p className="text-sm text-purple-200/80">
        Speaks: {user.nativeLanguage} • Learning: {user.learningLanguage}
      </p>
      <p className="text-sm text-purple-300/60">{user.location}</p>
    </div>
    {!isFriend && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddFriend(user._id);
        }}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
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
        // Filter out current user and friends from recommended users
        const friendIds = new Set(friendsResponse.data.friends.map(friend => friend._id));
        const filteredUsers = recommendedResponse.data.users.filter(
          (user) => user._id !== userResponse.data.user._id && !friendIds.has(user._id)
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-violet-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm mb-4">
            {error}
          </div>
        )}

        {/* User Profile Section */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/60 backdrop-blur-lg rounded-xl border border-purple-500/20 shadow-2xl p-8 mb-8"
          >
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full blur-lg opacity-50"></div>
                <img
                  src={currentUser.profilePicture}
                  alt={currentUser.name}
                  className="relative w-24 h-24 rounded-full border-2 border-purple-500/50 shadow-lg object-cover z-10"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-400">
                  {currentUser.name}
                </h1>
                <p className="text-purple-200/80 mt-1">
                  Native: {currentUser.nativeLanguage} • Learning:{" "}
                  {currentUser.learningLanguage}
                </p>
                <p className="text-purple-300/60 mt-1">
                  {currentUser.location}
                </p>
                <p className="text-purple-100/90 mt-2">{currentUser.bio}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Friends Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-400 mb-6">
            Your Friends
          </h2>
          {friends.length === 0 ? (
            <p className="text-purple-200/80">
              You haven't added any friends yet.
            </p>
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
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-400 mb-6">
            Recommended Language Partners
          </h2>
          {recommendedUsers.length === 0 ? (
            <p className="text-purple-200/80">
              No recommendations available at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedUsers
                .filter(user => user._id !== currentUser?.id) // Additional safety check
                .map((user) => (
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
    </div>
  );
};

export default Home;

import React, { useState } from "react";
import { motion } from "framer-motion";

const UserCard = ({ user, isFriend, onAddFriend, onFriendClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
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
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse rounded-full bg-purple-800/50 z-10" />
          )}
          <img
            src={user.profilePicture || "/default-avatar.png"}
            alt={user.name}
            className={`absolute inset-0 w-full h-full rounded-full border-2 border-purple-500/50 shadow-lg object-cover z-20 transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
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
};

export default UserCard;

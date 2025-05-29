import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../libs/axios";

const FriendRequestCard = ({ request, onAccept, onReject }) => {
  // Check if sender exists and has required properties
  if (!request?.sender) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4"
    >
      <img
        src={request.sender.profilePicture || "/default-avatar.png"}
        alt={request.sender.name || "User"}
        className="w-16 h-16 rounded-full border-2 border-indigo-200"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">
          {request.sender.name || "Unknown User"}
        </h3>
        <p className="text-sm text-gray-600">
          {request.sender.nativeLanguage && request.sender.learningLanguage ? (
            <>
              Speaks: {request.sender.nativeLanguage} • Learning:{" "}
              {request.sender.learningLanguage}
            </>
          ) : (
            "Language preferences not set"
          )}
        </p>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onAccept(request._id)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => onReject(request._id)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reject
        </button>
      </div>
    </motion.div>
  );
};

const Notifications = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        console.log("Fetching friend requests...");
        const response = await axiosInstance.get("/users/friend-requests");
        console.log("Full response:", response);
        console.log("Response data:", response.data);
        console.log("Incoming requests:", response.data?.incomingRequests);

        if (
          response.data?.success &&
          Array.isArray(response.data.incomingRequests)
        ) {
          console.log(
            "Setting friend requests:",
            response.data.incomingRequests
          );
          setFriendRequests(response.data.incomingRequests);
        } else {
          console.log("No friend requests found, setting empty array");
          setFriendRequests([]);
        }
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        setError("Failed to load friend requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendRequests();
  }, []);

  const handleAcceptRequest = async (requestId) => {
    try {
      console.log("Accepting request with ID:", requestId);
      const response = await axiosInstance.put(
        `/users/friend-request/${requestId}/accept`
      );
      console.log("Accept response:", response.data);

      if (response.data.success) {
        // Remove the accepted request from the list
        setFriendRequests((prev) =>
          prev.filter((request) => request._id !== requestId)
        );
        setError(""); // Clear any previous errors
      } else {
        setError(response.data.message || "Failed to accept friend request");
      }
    } catch (error) {
      console.error("Error accepting friend request:", error.response || error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to accept friend request"
      );
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axiosInstance.put(`/users/friend-request/${requestId}/reject`);
      setFriendRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      setError("Failed to reject friend request");
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Friend Requests</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {friendRequests.length === 0 ? (
        <p className="text-gray-600">No pending friend requests</p>
      ) : (
        <div className="space-y-4">
          {friendRequests.map((request) => (
            <FriendRequestCard
              key={request._id}
              request={request}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

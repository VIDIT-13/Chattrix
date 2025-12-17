import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../libs/axios";
import { StreamChat } from 'stream-chat';
import {
  Chat as StreamChatComponent,
  Channel,
  Window,
  MessageList,
  MessageInput,
  ChannelHeader,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

const chatClient = new StreamChat("hvxywn8dfm96");

const Chat = () => {
  const [streamToken, setStreamToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: friendId } = useParams();
  const location = useLocation();
  const [friend, setFriend] = useState(location.state?.friend);

  useEffect(() => {
    const loadFriendAndChat = async () => {
      if (!friendId) {
        setError("Invalid friend ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // If friend data is not in location state, fetch it
        if (!friend) {
          const friendResponse = await axiosInstance.get(`/users/friends`);
          const friendData = friendResponse.data.friends.find(
            (f) => f._id === friendId
          );
          if (!friendData) {
            throw new Error("Friend not found");
          }
          setFriend(friendData);
        }

        // Get Stream token and current user
        const [tokenResponse, userResponse] = await Promise.all([
          axiosInstance.get("/chat/token"),
          axiosInstance.get("/auth/me"),
        ]);

        if (!tokenResponse.data.token) {
          throw new Error("Failed to get chat token");
        }

        const token = tokenResponse.data.token;
        const currentUser = userResponse.data.user;

        // Connect user to Stream chat
        await chatClient.connectUser(
          {
            id: currentUser.id,
            name: currentUser.name,
            image: currentUser.profilePicture,
          },
          token
        );

        setStreamToken(token);
        console.log("Chat initialized successfully");
      } catch (error) {
        console.error("Error initializing chat:", error);
        setError(error.message || "Failed to initialize chat");
      } finally {
        setLoading(false);
      }
    };

    loadFriendAndChat();

    // Cleanup function
    return () => {
      const cleanup = async () => {
        if (chatClient?.userID) {
          await chatClient.disconnectUser();
        }
      };
      cleanup();
    };
  }, [friendId, friend]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {friend && (
          <div className="flex items-center space-x-4 mb-6 border-b pb-4">
            <img
              src={friend.profilePicture || "/default-avatar.png"}
              alt={friend.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-xl text-black font-semibold">{friend.name}</h2>
              <p className="text-sm text-gray-600">
                {friend.nativeLanguage} • {friend.learningLanguage}
              </p>
            </div>
          </div>
        )}

        <div className="h-[calc(100%-5rem)]">
          {streamToken && friend && chatClient.userID && (
            <StreamChatComponent client={chatClient} theme="messaging light">
              <Channel
                channel={chatClient.channel("messaging", [chatClient.userID, friend._id].sort().join('-'), {
                  name: friend.name,
                  image: friend.profilePicture,
                  members: [chatClient.userID, friend._id]
                })}
              >
                <Window>
                  <MessageList />
                  <MessageInput focus />
                </Window>
              </Channel>
            </StreamChatComponent>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.model.js";

export const getRecommendedUsers = async (req, res) => {
    try {
        const currentUserid = req.user.id; // Changed from .id to ._id to match MongoDB ObjectId
        console.log('Current User ID:', currentUserid);

        const currentuser = await User.findById(currentUserid).select("-password");
        if (!currentuser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find all onboarded users except current user and friends
        const recommendedUsers = await User.find({
            _id: { $ne: currentUserid },
            _id: { $nin: currentuser.friends || [] },
            onBoarded: true
        }).select("-password -__v");

        return res.status(200).json({
            success: true,
            count: recommendedUsers.length,
            users: recommendedUsers
        });
    }
    catch (error) {
        console.error("Error fetching recommended users:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

export const getfriends = async (req, res) => {
    try {
        const currentUserid = req.user.id;
        const currentuser = await User.findById(currentUserid).select("friends").populate("friends", "name profilePicture nativeLanguage learningLanguage");
        res.status(200).json({
            success: true,
            friends: currentuser.friends || []
        });

    } catch (error) {
        console.error("Error fetching friends:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const sendFriendRequest = async (req, res) => {
    try {
        const currentUserid = req.user.id;
        const {id :receipentid} = req.params;
        if( currentUserid === receipentid) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }
        const receipent = await User.findById(receipentid);
        if(!receipent) {
            return res.status(404).json({ message: "User not found" });
        }
        if(receipent.friends.includes(currentUserid)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }
        const existingrrequest=await FriendRequest.findOne({
            $or: [
                { sender: currentUserid, receiver: receipentid },
                { sender: receipentid, receiver: currentUserid }
            ],
        })
        if(existingrrequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }
        const friendRequest = new FriendRequest({
            sender: currentUserid,
            receiver: receipentid
        });
        await friendRequest.save();
        res.status(200).json({
            success: true,
            message: "Friend request sent successfully",
            friendRequest
        });
    } catch (error) {
        console.error("Error sending friend request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

export const acceptfriendRequest = async (req, res) => {
    try {
    const currentUserid = req.user.id;
    const { id } = req.params;
    const friendRequest = await FriendRequest.findById(id);
    if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
    }
    if (friendRequest.receiver.toString() !== currentUserid) {
        return res.status(403).json({ message: "You are not authorized to accept this friend request" });
    }
    friendRequest.status = "accepted";
    await friendRequest.save();
    await User.findByIdAndUpdate(currentUserid, {
        $addToSet: { friends: friendRequest.sender }
    });
    await User.findByIdAndUpdate(friendRequest.sender, {
        $addToSet: { friends: currentUserid }
    });
    res.status(200).json({
        success: true,
        message: "Friend request accepted successfully",
        friendRequest
    });
        
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

export const getFriendRequests = async (req, res) => {
     try {
        const incomingreqs= await FriendRequest.find({ receiver: req.user.id, status: "pending" }).populate("sender", "name profilePicture nativeLanguage learningLanguage");

        const acceptedreqs=await FriendRequest.find({ receiver: req.user.id, status: "accepted" }).populate("sender", "name profilePicture nativeLanguage learningLanguage");
        res.status(200).json({
            success: true,
            incomingRequests: incomingreqs,
            acceptedRequests: acceptedreqs
        });
        
     } catch (error) {
        console.error("Error fetching friend requests:", error);
        return res.status(500).json({ message: "Internal server error" });
        
     }
}

export const getOutgoingFriendsRequests = async (req, res) => {
    try {
        const outgoingRequests = await FriendRequest.find({ sender: req.user.id, status: "pending" }).populate("receiver", "name profilePicture nativeLanguage learningLanguage");
        res.status(200).json({
            success: true,
            outgoingRequests
        });
    } catch (error) {
        console.error("Error fetching outgoing friend requests:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

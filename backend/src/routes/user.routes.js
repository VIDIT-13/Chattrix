import express from 'express';
import { get } from 'mongoose';
import { protectRoute } from '../middleware/auth.middleware.js';
import { acceptfriendRequest, getFriendRequests, getfriends, getOutgoingFriendsRequests, getRecommendedUsers, sendFriendRequest } from '../controllers/user.controller.js';
 
const userRouter = express.Router();

userRouter.use(protectRoute);

userRouter.get('/',getRecommendedUsers);
userRouter.get('/friends',getfriends);

userRouter.post('/friend-request/:id',sendFriendRequest);
userRouter.put('/friend-request/:id/accept',acceptfriendRequest);

userRouter.get('/friend-requests',getFriendRequests);

userRouter.get('/outgoing-friends-requests',getOutgoingFriendsRequests);



export default userRouter;
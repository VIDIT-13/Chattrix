import express from "express";
import { login, logout, onboarding, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/login", login);  
authRouter.post("/signup", signup);

authRouter.post("/logout",logout);

authRouter.post('/onboarding',protectRoute,onboarding);

authRouter.get('/me',protectRoute,(req,res)=>{
    res.status(200).json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            profilePicture: req.user.profilePicture,
            bio: req.user.bio,
            nativeLanguage: req.user.nativeLanguage,
            learningLanguage: req.user.learningLanguage,
            location: req.user.location,
            onBoarded: req.user.onBoarded
        }
    });
})

export default authRouter; 
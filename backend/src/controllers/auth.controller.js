import { upsertStreamUser, generateStreamToken } from "../lib/stream.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all the fields",
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }
        const idx=Math.floor(Math.random() * 100)+1;
        const randomavatar=`https://avatar.iran.liara.run/public/${idx}.png`;
        const user = await User.findOne({email});
        if (user) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        const newUser = new User({
            name,
            email,
            password,
            profilePicture: randomavatar,
        });

        // First save the user to MongoDB to get the _id
        await newUser.save();
        console.log('MongoDB user created with ID:', newUser._id);

        // Then create the Stream user with the MongoDB _id
        try {
            const streamUserData = {
                id: newUser._id.toString(),
                name: newUser.name,
                image: newUser.profilePicture || ""
            };
            
            console.log('Creating Stream user with data:', streamUserData);
            const streamResponse = await upsertStreamUser(streamUserData);
            console.log('Stream user created successfully:', streamResponse);

            // Generate Stream token
            const streamToken = generateStreamToken(newUser._id.toString());
            console.log('Stream token generated successfully');

            const token = jwt.sign(
                { userId: newUser._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            // Set the cookie before sending the response
            res.cookie("jwt", token, {
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            // Send the response with user data
            return res.status(201).json({
                message: "User created successfully",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    profilePicture: newUser.profilePicture,
                    onBoarded: newUser.onBoarded,
                    bio: newUser.bio,
                    nativeLanguage: newUser.nativeLanguage,
                    learningLanguage: newUser.learningLanguage,
                    location: newUser.location
                },
                token,
                streamToken
            });

        } catch (streamError) {
            console.error('Detailed Stream error during signup:', streamError);
            
            // If Stream user creation fails, delete the MongoDB user
            await User.findByIdAndDelete(newUser._id);
            console.log('Deleted MongoDB user due to Stream user creation failure');
            
            return res.status(500).json({
                message: "Failed to create user in Stream. Please try again.",
                error: streamError.message
            });
        }

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set cookie
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Send response
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            },
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const logout = async (req, res) => {
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json({
        message: "Logout successful",
    });
}

export const onboarding = async (req, res) => {
    try {
        // Get the user ID from the authenticated user
        const userId = req.user._id;
        console.log('Onboarding request for user:', userId);
        
        const user = await User.findById(userId);
        console.log('Found user:', user?._id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const { bio, nativeLanguage, learningLanguage, location  } = req.body;
        if (!bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "Please fill all the fields",
            });
        }
        user.bio = bio;
        user.nativeLanguage = nativeLanguage;
        user.learningLanguage = learningLanguage;
        user.location = location;
        user.onBoarded = true;
        await user.save();
        // Update Stream user with onboarding data
        try {
            const streamUserData = {
                id: user._id.toString(),
                name: user.name,
                image: user.profilePicture || "",
                bio: user.bio,
                nativeLanguage: user.nativeLanguage,
                learningLanguage: user.learningLanguage,
                location: user.location
            };
            
            console.log('Updating Stream user with data:', streamUserData);
            await upsertStreamUser(streamUserData);
            console.log('Stream user updated successfully');
        } catch (streamError) {
            console.error('Detailed Stream error during onboarding:', streamError);
            return res.status(500).json({
                message: "Failed to update user in Stream. Please try again.",
                error: streamError.message
            });
        }
        res.status(200).json({
            message: "Onboarding successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                bio: user.bio,
                nativeLanguage: user.nativeLanguage,
                learningLanguage: user.learningLanguage,
                location: user.location
            }
        });
        
    } catch (error) {
        console.error("Onboarding error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
        
    } 
};
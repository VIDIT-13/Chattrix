import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import dotenv from 'dotenv';
dotenv.config();

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await User.findById(decoded.userId).select("-password");
            
            if (!user) {
                return res.status(401).json({ message: "Unauthorized - User not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

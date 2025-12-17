import dotenv from "dotenv";
dotenv.config();

import express from "express";
import authRouter from "./routes/auth.routes.js";
import connectDB from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chat.route.js";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://chattrix-kappa.vercel.app"
  ],
  credentials: true
}));

app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/chat', chatRouter);

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("Chattrix Backend API is Live 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

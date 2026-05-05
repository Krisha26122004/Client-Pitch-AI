import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import connectDB from "./config/db.js";

// Models
import User from "./models/User.js";

// Routes
import authRoutes from "./routes/auth.js";
import pitchRoutes from "./routes/pitches.js";
import analyticsRoutes from "./routes/analytics.js";
import paymentRoutes from "./routes/payment.js";
import chatRoutes from "./routes/chatRoutes.js";
import aiRoutes from "./routes/ai.js";
import contactRoutes from "./routes/contact.js";

const app = express();

// Root route for deployment verification
app.get("/", (req, res) => {
    res.send("🚀 ClientPitch AI API is Running...");
});

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean);

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json());

// 1. Status Route
app.get("/api/user-status/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            pitchCount: user.pitchCount || 0,
            plan: user.plan || "free",
            remaining: user.plan === "pro" ? "Unlimited" : Math.max(0, 5 - (user.pitchCount || 0))
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});


// 2. Direct Analytics Route (Ensures it works)
app.use("/api", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pitches", pitchRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/contact", contactRoutes);

// Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Premium Server running on port ${PORT}`);
});

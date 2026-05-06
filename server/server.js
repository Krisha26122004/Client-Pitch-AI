import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../client/dist");

// Root route for deployment verification
app.get("/api", (req, res) => {
    res.send("🚀 ClientPitch AI API is Running...");
});

const allowedOrigins = [
    ...(process.env.CLIENT_URL || "").split(","),
    ...(process.env.CLIENT_URLS || "").split(","),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].map((origin) => origin.trim()).filter(Boolean);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;

    try {
        const { hostname, protocol } = new URL(origin);
        return protocol === "https:" && hostname.endsWith(".vercel.app");
    } catch {
        return false;
    }
};

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "ClientPitch AI API",
        allowedOrigins,
        mongoConfigured: Boolean(process.env.MONGO_URI),
    });
});

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

if (process.env.NODE_ENV === "production") {
    app.use(express.static(clientDistPath));

    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(clientDistPath, "index.html"));
    });
}

// Database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Premium Server running on port ${PORT}`);
});

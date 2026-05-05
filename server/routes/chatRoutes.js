import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAIModel } from "../utils/gemini.js";

const router = express.Router();

router.post("/send", authMiddleware, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const today = new Date().toDateString();
        const last = new Date(user.lastChatReset || 0).toDateString();

        if (today !== last) {
            user.chatCount = 0;
            user.lastChatReset = new Date();
        }

        if (user.plan === "free" && user.chatCount >= 10) {
            return res.status(403).json({
                message: "You've reached your daily limit. Upgrade to Pro to continue 🚀"
            });
        }

        user.chatCount += 1;
        await user.save();

        const model = getAIModel();
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are ClientPitch AI assistant. Help the user with writing proposals, business advice, and pitch improvements. Be concise, professional, and helpful." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to help you craft the perfect pitch." }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const reply = response.text();

        res.json({ reply });
    } catch (err) {
        console.error("Chat Error:", err);
        res.status(500).json({ error: err.message || "Failed to get AI response" });
    }
});

export default router;

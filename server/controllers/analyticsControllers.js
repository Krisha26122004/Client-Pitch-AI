import mongoose from "mongoose";
import Pitch from "../models/Pitch.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("Analytics Request for UserID:", userId);

        const user = await User.findById(userId);
        const used = user ? user.pitchCount : 0;

        // Validate userId format to avoid mongoose errors
        const isValidId = mongoose.Types.ObjectId.isValid(userId);
        
        const pitches = await Pitch.find({
            $or: [
                { userId: userId },
                ...(isValidId ? [{ userId: new mongoose.Types.ObjectId(userId) }] : [])
            ]
        });
        console.log(`Deep Sync: Found ${pitches.length} pitches for user ${userId}`);

        const totalPitches = pitches.length;
        const totalShares = pitches.reduce((acc, p) => acc + (p.shares || 0), 0);
        const pinned = pitches.filter(p => p.isPinned).length;
        const archived = pitches.filter(p => p.isArchived).length;
        const active = pitches.filter(p => !p.isArchived).length;

        const templateUsage = {};
        pitches.forEach(p => {
            const template = p.template || "Standard";
            templateUsage[template] = (templateUsage[template] || 0) + 1;
        });

        const templateStats = Object.entries(templateUsage)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const pitchTrends = {};
        pitches.forEach(p => {
            const date = new Date(p.createdAt).toLocaleDateString();
            pitchTrends[date] = (pitchTrends[date] || 0) + 1;
        });

        const topShared = [...pitches]
            .sort((a, b) => (b.shares || 0) - (a.shares || 0))
            .slice(0, 5);

        const topPinned = pitches.filter(p => p.isPinned).slice(0, 5);

        const recent = [...pitches]
            .sort((a, b) => new Date(b.updated || b.createdAt) - new Date(a.updated || a.createdAt))
            .slice(0, 8)
            .map(p => `${p.lastAction || "Updated"}: ${p.title}`);

        res.json({
            totalPitches,
            totalShares,
            pinned,
            archived,
            active,
            pitchTrends,
            templateStats,
            topPinned,
            topShared,
            recent,
            used
        });
    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json({
            message: "Analytics Error"
        });
    }
};

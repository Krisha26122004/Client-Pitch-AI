import express from "express";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Pitch from "../models/Pitch.js";

const router = express.Router();

router.post("/save", async (req, res) => {
    try {
        const { title, content, userId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // DAILY RESET LOGIC
        const today = new Date().toDateString();
        const last = new Date(user.lastReset).toDateString();

        if (today !== last) {
            user.pitchCount = 0;
            user.lastReset = new Date();
        }

        if (user.plan === "free" && user.pitchCount >= 5) {
            return res.status(403).json({
                message: "Daily Limit Reached",
                remaining: 0,
            });
        }
        
        const pitch = await Pitch.create({
            title,
            content,
            userId,
        });

        user.pitchCount += 1;
        await user.save();

        res.status(201).json({
            pitch,
            remaining: user.plan === "pro" ? "Unlimited" : 5 - user.pitchCount,
        });
    } catch (error) {
        console.error("Save Pitch Error:", error);
        res.status(500).json({ message: "Error Saving Pitch" });
    }
});

// Get all pitches for a user
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId || userId.length !== 24) {
            return res.status(400).json({ message: "Invalid User ID" });
        }
        const pitches = await Pitch.find({ userId }).sort({ updated: -1 });
        res.json(pitches);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/create", async (req, res) => {
    const {
        userId, title, clientName, company, projectType, budget, timeline, description,
        audience, tone, content, template, pitchGoal, outputFormat, brandVoice,
        premiumSections, priorityMode, sections
    } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // DAILY RESET LOGIC
        const today = new Date().toDateString();
        const last = new Date(user.lastReset).toDateString();

        if (today !== last) {
            user.pitchCount = 0;
            user.lastReset = new Date();
        }

        // LIMIT CHECK (FREE PLAN)
        if (user.plan === "free" && user.pitchCount >= 5) {
            return res.status(403).json({
                message: "You’ve reached your daily limit of 5 pitches. Upgrade to Pro 🚀"
            });
        }

        // INCREMENT COUNT
        user.pitchCount += 1;
        await user.save();

        // CREATE PITCH
        const newPitch = new Pitch({
            userId,
            title: title || `${projectType || 'Project'} Pitch for ${company || clientName || 'Client'}`,
            clientName: clientName || company || "Client",
            company: company || clientName,
            projectType,
            budget,
            timeline,
            description,
            audience,
            tone,
            content: content || "Generating content...",
            template,
            pitchGoal,
            outputFormat,
            brandVoice,
            premiumSections,
            priorityMode,
            sections,
            lastAction: "Created"


        });


        await newPitch.save();

        //RETURN RESPONSE WITH REMAINING
        res.status(201).json({
            pitch: newPitch,
            remaining: 5 - user.pitchCount
        });

    } catch (err) {
        console.error("Pitch Creation Error:", err);
        res.status(500).json({ message: err.message || "Server Error" });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const pitch = await Pitch.findByIdAndDelete(req.params.id);
        if (!pitch) return res.status(404).json({ message: "Pitch not found" });
        res.json({ message: "Pitch deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/update/:id", async (req, res) => {
    try {
        const updated = await Pitch.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updated: new Date().toISOString().split('T')[0], lastAction: "Updated" },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Pitch not found" });
        res.json(updated);
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/share/:id", async (req, res) => {
    try {
        const pitch = await Pitch.findById(req.params.id);

        if (!pitch) {
            return res.status(404).json({ message: "Pitch not Found" });
        }

        pitch.shareId = uuidv4();
        pitch.isPublic = true;

        pitch.shares = (pitch.shares || 0) + 1;
        pitch.lastAction = "Shared";

        await pitch.save();

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

        res.json({
            link: `${clientUrl.replace(/\/$/, "")}/share/${pitch.shareId}`
        });
    } catch (err) {
        console.error("Share Error", err);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/public/:sharedId", async (req, res) => {
    try {
        const pitch = await Pitch.findOne({
            shareId: req.params.sharedId,
            isPublic: true
        });

        if (!pitch) {
            return res.status(404).json({ message: "Pitch not Found" });
        }

        pitch.views = (pitch.views || 0) + 1;
        await pitch.save();

        res.json(pitch);
    } catch (error) {
        console.error("Public fetch Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/pin/:id", async (req, res) => {
    try {
        const pitch = await Pitch.findById(req.params.id);

        if (!pitch) return res.status(404).json({ message: "Not found" });

        pitch.isPinned = !pitch.isPinned;
        pitch.lastAction = pitch.isPinned ? "Pinned" : "Unpinned";
        await pitch.save();

        res.json(pitch);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/archive/:id", async (req, res) => {
    try {
        const pitch = await Pitch.findById(req.params.id);

        if (!pitch) return res.status(404).json({ message: "Not Found" });

        pitch.isArchived = !pitch.isArchived;
        pitch.lastAction = pitch.isArchived ? "Archived" : "Restored";
        await pitch.save();

        res.json(pitch);


    } catch (err) {
        res.status(500).json({ message: "Server Error " });
    }
})
export default router;

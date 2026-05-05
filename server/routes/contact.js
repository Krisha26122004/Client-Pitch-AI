import express from "express";
import { sendContactEmail } from "../utils/sendEmail.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const subject = req.body.subject?.trim();
        const message = req.body.message?.trim();

        if (!name || !email || !message) {
            return res.status(400).json({ message: "Name, email, and message are required." });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address." });
        }

        await sendContactEmail({ name, email, subject, message });
        res.json({ message: "Message sent successfully." });
    } catch (error) {
        console.error("Contact Route Error:", error);
        res.status(500).json({ message: error.message || "Could not send message." });
    }
});

export default router;

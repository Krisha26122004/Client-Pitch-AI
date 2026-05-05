import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import { sendOTPEmail } from "../utils/sendEmail.js";

const router = express.Router();
const isStrongPassword = (password = "") =>
    password.length >= 6 && /[^A-Za-z0-9]/.test(password);

const passwordRuleMessage = "Password must be at least 6 characters and include one special character.";
const isBcryptHash = (value = "") => /^\$2[aby]\$\d{2}\$/.test(value);

router.post("/send-otp", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        user.otp = otp;
        user.otpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
        await user.save();
        
        await sendOTPEmail(email, otp);
        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Send OTP Route Error:", error.message);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        let { email, otp, newPassword } = req.body;
        email = email.toLowerCase();
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ message: passwordRuleMessage });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/signup", async (req, res) => {
    try {
        let { fullName, email, password, company } = req.body;
        email = email.toLowerCase().trim();
        password = password.trim();

        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: passwordRuleMessage });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Account already exists. Please sign in instead." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ fullName, email, password: hashedPassword, company });
        await newUser.save();

        res.json({
            message: "Signup Successful",
            userId: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            company: newUser.company
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();
        password = password.trim();
        console.log("Login Attempt:", { email, password: password ? "********" : "MISSING" });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        let isMatch = false;

        if (isBcryptHash(user.password)) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = password === user.password;
            if (isMatch) {
                user.password = await bcrypt.hash(password, 10);
                await user.save();
            }
        }

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.json({
            message: "Login Successful",
            userId: user._id,
            fullName: user.fullName,
            email: user.email,
            company: user.company
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/user/upgrade", async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { plan: "pro" },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Upgraded to Pro successfully", plan: user.plan });
    } catch (error) {
        console.error("Upgrade Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Basic validation for MongoDB ObjectId
        if (!userId || userId.length !== 24) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // DAILY RESET LOGIC (Keep counts fresh)
        const today = new Date().toDateString();
        const last = new Date(user.lastReset).toDateString();
        if (today !== last) {
            user.pitchCount = 0;
            user.lastReset = new Date();
            await user.save();
        }

        res.json({
            pitchCount: user.pitchCount,
            plan: user.plan,
            remaining: user.plan === "pro" ? "Unlimited" : Math.max(0, 5 - user.pitchCount)
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// BACKUP STATUS ROUTE
router.get("/status/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({
            pitchCount: user.pitchCount,
            plan: user.plan,
            remaining: user.plan === "pro" ? "Unlimited" : Math.max(0, 5 - user.pitchCount)
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;

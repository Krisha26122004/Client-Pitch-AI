import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    otp: String,
    otpExpiry: Date,
    company: String,

    plan: {
        type: String,
        default: "free",
    },
    //pitch limit for free user
    pitchCount: {
        type: Number,
        default: 0
    },
    lastReset: {
        type: Date,
        default: Date.now
    },

    //chat limit for free user 
    chatCount: {
        type: Number,
        default: 0
    },
    lastChatReset: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("User", userSchema);

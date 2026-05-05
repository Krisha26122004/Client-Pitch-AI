import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./models/User.js";

const checkUserLimit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: "nidhi@gmail.com" });
        console.log(`USER: ${user.email}, PITCH COUNT: ${user.pitchCount}, PLAN: ${user.plan}`);
        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error.message);
    }
};

checkUserLimit();

import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Pitch from "./models/Pitch.js";
import User from "./models/User.js";

const auditPitches = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Atlas.");

        const allPitches = await Pitch.find({});
        console.log(`Total Pitches found in DB: ${allPitches.length}`);

        if (allPitches.length > 0) {
            allPitches.forEach(p => {
                console.log(`- Pitch: ${p.title}, UserID in Doc: ${p.userId}`);
            });
        }

        const users = await User.find({});
        console.log("\nUsers in DB:");
        users.forEach(u => {
            console.log(`- User: ${u.fullName} (${u.email}), ID: ${u._id}`);
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error("Audit Error:", error);
    }
};

auditPitches();

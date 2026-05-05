import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Pitch from "./models/Pitch.js";

const countPitches = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Atlas.");
        
        const count = await Pitch.countDocuments();
        console.log(`DATABASE VERIFICATION: There are currently ${count} pitches stored in Atlas.`);
        
        const pitches = await Pitch.find({}, 'title');
        pitches.forEach((p, i) => console.log(` ${i+1}. ${p.title}`));

        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error.message);
    }
};

countPitches();

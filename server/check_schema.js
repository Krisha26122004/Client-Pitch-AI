import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Pitch from "./models/Pitch.js";

const checkSchema = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const rawPitch = await mongoose.connection.db.collection('pitches').findOne({});
        console.log("RAW PITCH KEYS:", Object.keys(rawPitch));
        console.log("RAW PITCH DATA:", rawPitch);
        await mongoose.connection.close();
    } catch (error) {
        console.error("Error:", error.message);
    }
};

checkSchema();
